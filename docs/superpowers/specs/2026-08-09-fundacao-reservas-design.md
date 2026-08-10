# Fundação: site + banco de dados de reservas + integração com Google Calendar

Data: 2026-08-09
Status: aprovado para plano de implementação

## Contexto

O Pouso das Castanheiras tem hoje um handoff de design de alta fidelidade (protótipo HTML estático em `design-source/`, ver pasta `design_handoff_pouso_castanheiras` no Desktop) para um site institucional e de reservas. O protótipo não tem backend: o formulário de reserva só monta um link `wa.me` com uma mensagem pronta, sem persistência, sem controle de disponibilidade real e sem notificações.

Este documento é o primeiro de uma série de sub-projetos que juntos entregam a plataforma completa:

1. **Fundação: site + banco de dados de reservas + Google Calendar** (este documento)
2. Automação de WhatsApp (parcialmente absorvida aqui — ver "Notificações" abaixo — mas com espaço para evoluir depois, ex. lembretes automáticos ao hóspede, confirmação bidirecional)
3. Painel administrativo com login (explicitamente fora de escopo por ora)
4. Pagamento online (explicitamente fora de escopo por ora)

O Google Calendar foi escolhido pelo cliente como a interface operacional principal de aprovação de reservas — não é um "nice to have" acoplado depois, é central ao fluxo.

## Objetivo

Recriar o site em Next.js com fidelidade ao design handoff, e substituir o formulário estático por um fluxo real de reserva: o pedido do hóspede gera uma pré-reserva no banco de dados e um convite de evento no Google Calendar da pousada; a reserva só é confirmada e a data só é bloqueada quando alguém da pousada aceita esse convite na própria agenda. Notificações automáticas por e-mail e WhatsApp mantêm hóspede e pousada informados em cada etapa, sem exigir nenhum painel novo de login.

## Fora de escopo (explicitamente adiado)

- Automação de WhatsApp para o hóspede (ele continua recebendo e enviando via link `wa.me` manual, como hoje).
- Painel administrativo com login — a Google Agenda é a interface de gestão.
- Pagamento online — segue negociado por fora (telefone/WhatsApp/transferência).
- Preenchimento das fotos e vídeos faltantes listados no README do handoff (táxi, van, hidroavião parado, vídeos por atividade) — segue como pendência de conteúdo do cliente, não deste projeto.

## Arquitetura

- **Next.js 14+ (App Router, TypeScript)**, hospedado na Vercel.
  - Fase de validação com o cliente: conta pessoal do desenvolvedor, plano Hobby.
  - Produção oficial (decisão futura, fora deste documento): Vercel Pro (~US$20/mês) ou Locaweb, a depender do plano que a pousada já tiver contratado lá.
- **Neon Postgres + Prisma** para os dados de reserva (free tier é suficiente para o volume esperado).
- **Google Calendar API**, autenticada contra uma conta Gmail dedicada criada especificamente para este fim (ex.: `reservas.pousodascastanheiras@gmail.com`), já que o e-mail atual do domínio (`contato@pousodascastanheiras.com.br`) está na Locaweb e não é Google Workspace.
- **Vercel Cron** rodando a cada poucos minutos (ex.: 5 min), sincronizando o estado do Google Calendar com o banco — ver "Sincronização" abaixo.
- **Resend** para e-mails transacionais (free tier cobre até 3.000 e-mails/mês).
- **Z-API** (ou provedor não-oficial equivalente — Evolution API, UltraMsg) para envio automático de WhatsApp à pousada. A integração fica isolada atrás de uma interface própria (`sendWhatsAppNotification`) para permitir trocar de provedor, ou migrar futuramente para a API oficial da Meta, sem reescrever o fluxo de reserva.
- **WhatsApp para o hóspede**: sem automação — mantém o link `wa.me` manual já existente no protótipo.

### Por que polling em vez de webhooks do Google Calendar

Notificações push do Google Calendar exigem um "canal de observação" que expira em até 7 dias e precisa ser renovado, além de validação de token. Para o volume de reservas de uma pousada (poucas por semana), um cron de poucos minutos é suficiente, muito mais simples de manter e sem partes frágeis relacionadas à renovação de canal.

## Modelo de dados

```
Reservation
  id                   uuid, PK
  status               enum: pending | confirmed | declined | cancelled | pending_sync_error
  checkIn              date
  checkOut             date
  packageSlug          string
  transfer             enum: taxi | van | hidro | depois
  pax                  int
  guestName            string
  guestEmail           string
  guestPhone           string
  notes                text, nullable
  season               enum: baixa | alta | especial
  priceQuoted          decimal
  googleEventId         string, nullable       -- preenchido após criar o evento no Calendar
  createdAt            timestamp
  confirmedAt          timestamp, nullable
  declinedAt           timestamp, nullable
  guestNotifiedAt       timestamp, nullable      -- e-mail de "reserva recebida" enviado
  guestStatusEmailAt    timestamp, nullable      -- e-mail de confirmação/recusa enviado
  pousadaEmailSentAt    timestamp, nullable
  pousadaWhatsappSentAt timestamp, nullable

AvailabilityCache      -- repopulada a cada rodada do cron; fonte usada pelo calendário do site
  id                   uuid, PK
  startDate            date
  endDate              date
  source               enum: reservation | manual
  googleEventId         string
  reservationId         uuid, FK nullable       -- nulo quando source = manual
```

## Fluxo de reserva

1. Hóspede preenche o formulário na página de Reserva e envia.
2. API do site (`/api/reserva`):
   a. Calcula temporada e preço (porta a lógica já existente no protótipo — função `season`).
   b. Cria o registro `Reservation` com `status = pending`.
   c. Cria um evento no Google Calendar da conta dedicada, com `reservas@...` como convidado, e grava o ID da reserva nas propriedades privadas do evento (`extendedProperties.private.reservationId`) para correlação posterior. Se já existir outra pré-reserva pendente com datas sobrepostas, o título/descrição do evento sinaliza o conflito, para quem for decidir na agenda enxergar isso.
   d. Salva `googleEventId` na reserva.
   e. Dispara em paralelo, sem bloquear a resposta ao hóspede caso alguma falhe:
      - e-mail para a pousada (novo pedido, com link direto para o evento no Calendar);
      - e-mail para o hóspede (status "reserva recebida");
      - mensagem de WhatsApp para o número interno da pousada (via Z-API), com resumo do pedido.
   f. Cada canal de notificação grava seu próprio timestamp de envio (`pousadaEmailSentAt`, `guestNotifiedAt`, `pousadaWhatsappSentAt`) e loga falhas sem interromper o fluxo.
3. **Enquanto pendente, a data continua disponível no site** — só trava quando o convite é aceito. Essa é uma decisão consciente do cliente: o risco de duas pré-reservas concorrentes para a mesma data é aceito, mitigado pelo aviso de conflito no evento do Calendar (passo 2c).
4. Cron de sincronização (a cada ~5 min) percorre os eventos futuros da agenda:
   - Evento com `reservationId` nas propriedades privadas (criado pelo sistema):
     - Convite **aceito** pelo convidado → `Reservation.status = confirmed`, `confirmedAt` preenchido, entra em `AvailabilityCache` como bloqueado, dispara e-mail de confirmação ao hóspede (se ainda não enviado).
     - Convite **recusado** → `Reservation.status = declined`, `declinedAt` preenchido, evento removido do Calendar (libera a data), dispara e-mail de recusa ao hóspede (se ainda não enviado).
     - Ainda sem resposta (`needsAction`/`tentative`) → nada muda, continua não bloqueando.
   - Evento **sem** `reservationId` (criado manualmente na agenda pela equipe) → tratado como bloqueio manual: todo o intervalo de datas do evento entra em `AvailabilityCache` com `source = manual`. Se o evento for removido da agenda, some do cache na próxima rodada e a data volta a ficar disponível no site.
   - A rodada recalcula e substitui o conteúdo de `AvailabilityCache` a cada execução (ou faz diff), garantindo que o cache nunca fique permanentemente desatualizado mesmo se uma rodada falhar.
5. O calendário de disponibilidade da página de Reserva lê de `AvailabilityCache` (não consulta o Google ao vivo a cada visita — mais rápido e resiliente a instabilidade da API do Google).

## Reconstrução do front-end

- Cada página do protótipo (`home`, `casa`, `experiencias`, `chegar`, `tarifas`, `reserva`, `midia`) vira uma rota do App Router.
- Conteúdo hoje embutido no script do protótipo (`ACTS`, `PKGS`, `PRICES`, `ROTEIROS`, `TR_LABEL`, traduções) migra para módulos TypeScript tipados.
- i18n via `next-intl`: português como padrão sem prefixo, inglês com prefixo `/en`; os pares pt/en já presentes no protótipo (atributos `data-en` e objetos `.en`) viram os arquivos de mensagens de cada idioma.
- Tokens de design (cores, tipografia, espaçamento, breakpoints) documentados no README do handoff são portados como estão — alta fidelidade visual é requisito confirmado com o cliente.
- Imagens via `next/image` com `sizes` corretos; mapa de Como Chegar mantém Leaflet/OpenStreetMap (adaptado de `route-map.html`); vídeo do hidroavião como asset estático.
- Página de Reserva: calendário de duas colunas passa a consultar `AvailabilityCache` via endpoint do site, em vez do estado local em memória do protótipo. Regras de seleção de intervalo (primeiro clique = check-in, segundo = check-out, clique no mesmo dia limpa, data anterior reordena) e datas passadas desabilitadas são preservadas.

## Erros e casos extremos

- Falha ao criar o evento no Calendar após já ter salvo a reserva no banco → `status = pending_sync_error`; o cron tenta recriar o evento nas rodadas seguintes; o pedido do hóspede não se perde.
- Token OAuth da conta Google expira ou é revogado → a rodada de sincronização falha de forma visível (log + alerta por e-mail para a equipe técnica); o site continua servindo a última disponibilidade conhecida em `AvailabilityCache` em vez de quebrar.
- Falha de envio de e-mail (Resend) ou WhatsApp (Z-API) → logada individualmente, não bloqueia a criação da reserva nem os outros canais de notificação.
- Duas pré-reservas concorrentes para as mesmas datas → ambas visíveis como pendentes; o aviso de conflito no evento do Calendar orienta quem for aceitar; aceitar uma automaticamente não recusa a outra — cabe a quem está gerenciando a agenda recusar manualmente a que não vingou.

## Testes

- Testes unitários da lógica de cálculo de temporada/preço (função pura portada do protótipo).
- Testes unitários da lógica de reconciliação do cron, mockando respostas da Google Calendar API — maior superfície de risco do projeto, prioridade de cobertura.
- Teste de integração da rota `/api/reserva` (banco + cliente do Calendar mockados).
- Teste manual ponta a ponta: preencher reserva no navegador → conferir evento criado no Calendar → aceitar → conferir e-mail de confirmação e data bloqueada no site; repetir o caminho de recusa.

## Custo mensal estimado

| Serviço | Fase de validação | Produção oficial |
|---|---|---|
| Vercel | R$0 (Hobby, conta pessoal) | ~R$110/mês (Pro) |
| Neon Postgres | R$0 | R$0 |
| Resend | R$0 | R$0 |
| Z-API (ou similar) | ~R$50–100/mês | ~R$50–100/mês |
| **Total** | **~R$50–100/mês** | **~R$160–210/mês** |

Domínio e e-mail (`pousodascastanheiras.com.br`, Locaweb) já são custos existentes, não adicionais deste projeto.

## Decisões em aberto para sub-projetos futuros

- Se/quando migrar o envio de WhatsApp do provedor não-oficial para a API oficial da Meta.
- Se/quando adicionar painel administrativo com login.
- Onde hospedar em produção oficial (Vercel Pro vs. Locaweb) — depende do plano que a pousada já tem contratado lá.
