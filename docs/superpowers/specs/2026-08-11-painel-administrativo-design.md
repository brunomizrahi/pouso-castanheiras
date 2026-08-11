# Painel administrativo — protótipo funcional

Data: 2026-08-11
Status: aprovado para plano de implementação

## Contexto

O Pouso das Castanheiras tem hoje um site institucional completo no ar (Next.js, ver `docs/superpowers/specs/2026-08-09-fundacao-reservas-design.md`) e uma spec aprovada — mas ainda não implementada — para o banco de dados de reservas e a integração com Google Calendar. O cliente quer, além disso, uma área logada onde a equipe da pousada acompanha reservas, controla pagamentos e traslados, projeta o financeiro e edita o tarifário do site.

Dado o tamanho do pedido, ele foi decomposto em sub-projetos (ver decisão registrada na conversa de brainstorming de 2026-08-11):

1. **Fundação** (banco de dados + Google Calendar) — spec já aprovada, implementação pendente.
2. **Painel administrativo — protótipo funcional** (este documento) — construído com dados de exemplo, para validação visual e de fluxo com o cliente antes de investir na integração.
3. **Integração** — conectar o painel a dados reais: sincronização com Google Calendar (via a Fundação) e a página `/tarifas` do site público passando a ler do banco em vez de conteúdo estático. Planejado depois que o cliente aprovar o protótipo.
4. **CMS de experiências** — explicitamente adiado pelo cliente ("depois vamos criar").

Este documento cobre exclusivamente o item 2.

## Objetivo

Construir uma área logada (`/painel`), seletivamente reaproveitando o schema de dados que a Fundação também usará, com autenticação própria (login + segundo fator), onde a equipe da pousada consegue: ver um calendário de disponibilidade com status de pagamento, cadastrar e editar reservas (inclusive as que chegam por telefone, fora do site), controlar o status do traslado de cada reserva, acompanhar valores a receber e provisionamento financeiro por período, e editar os pacotes/preços do tarifário. O painel roda com dados de exemplo (seed) nesta fase — a conexão com o Google Calendar real e com o site público é escopo do sub-projeto de Integração.

## Decisões confirmadas com o cliente

- **Múltiplos usuários da equipe**, todos com o mesmo nível de acesso (sem perfis/permissões diferenciadas nesta fase).
- **Autenticação construída internamente** (não um provedor gerenciado como Clerk) — login com e-mail/senha mais TOTP (código de 6 dígitos via app autenticador) como segundo fator. Decisão consciente do cliente: mais controle e sem mensalidade de terceiro, em troca de mais superfície de código sensível para manter.
- **Controle de pagamento é manual**: a equipe atualiza o status na tela depois de conferir o pagamento por fora (Pix, transferência). Nenhum gateway de pagamento, nenhuma cobrança emitida pelo sistema — consistente com a decisão já tomada para a automação de WhatsApp.
- **Reservas podem ser criadas manualmente no painel** (ex.: pedido por telefone), além das que chegarão do formulário do site.
- **Controle de traslado detalhado**: além do status (organizado/pendente), guarda o fornecedor contratado, horário combinado e observações — porque a pousada apenas intermedia a contratação (táxi da cooperativa, van executiva, hidroavião), não opera o transporte, então esses dados são o registro de "o que foi combinado com o fornecedor".
- **Histórico de hóspedes é uma lista pesquisável de reservas passadas** (filtro por nome/período), não um perfil agregado por hóspede.
- **Tarifário reflete no site imediatamente, sem cache** — quando a Integração acontecer, a página `/tarifas` do site consulta o banco a cada visita.
- **Alerta de pagamento pendente aparece em dois lugares**: destacado na tela de Visão Geral e como contador no item "Reservas" do menu.
- **Navegação em menu lateral fixo** (validado visualmente com o cliente), com as seções: Visão Geral, Calendário, Reservas, Financeiro, Tarifário.
- **Status do calendário usa fundo suave + borda colorida** (validado visualmente com o cliente) — não célula colorida cheia.

## Arquitetura

- **Next.js App Router**, grupo de rotas protegido `app/(painel)/painel/...` no mesmo projeto `pouso-castanheiras` já existente — não é um projeto separado.
- **Auth.js (NextAuth v5) com Credentials Provider**: e-mail + senha, hash com `bcrypt`. Sessão via JWT em cookie `httpOnly`, `secure`, `sameSite=lax`.
- **Segundo fator (TOTP)**: biblioteca `otplib`, compatível com Google Authenticator/Authy/1Password. No cadastro do usuário, o sistema gera um segredo TOTP, mostra um QR code (via `qrcode`) para parear com o app autenticador; login exige e-mail+senha e, em seguida, o código de 6 dígitos. O segredo TOTP é armazenado criptografado em repouso (AES-256-GCM com uma chave de aplicação em variável de ambiente, nunca em texto puro no banco).
- **Rate limiting no login**: no máximo 5 tentativas por e-mail a cada 15 minutos (bloqueio temporário), para mitigar força bruta — tanto na senha quanto no código TOTP.
- **Neon Postgres + Prisma** — mesmo banco que a Fundação usará. As tabelas abaixo (`Reservation`, `Package`) são desenhadas para serem compatíveis com o modelo de dados já definido na spec da Fundação, evitando retrabalho de migração quando a Integração acontecer.
- Sem processamento de pagamento, sem chamada a APIs externas de calendário ou WhatsApp nesta fase — o painel é autocontido.

## Modelo de dados

```
StaffUser
  id              uuid, PK
  email           string, unique
  passwordHash    string
  totpSecretEnc   string, nullable        -- criptografado; nulo até o usuário concluir o setup de 2FA
  totpEnabledAt   timestamp, nullable
  createdAt       timestamp

Package
  id              uuid, PK
  slug            string, unique          -- ex. "rio-negro", "macucus", "ajuricaba", "pouso"
  name            string
  description     text
  nights          int, nullable           -- nulo para o pacote "Pouso" (por diária)
  priceLow        decimal
  priceHigh       decimal
  priceSpecial    decimal, nullable       -- nulo quando o pacote não opera em temporada especial
  active          boolean, default true
  updatedAt       timestamp

Reservation
  id                  uuid, PK
  source              enum: site | manual
  status              enum: aguardando_sinal | aguardando_pagamento | pago
  checkIn             date
  checkOut            date
  guestName           string
  guestEmail          string, nullable
  guestPhone          string
  packageId           uuid, FK -> Package
  pax                 int
  notes               text, nullable
  totalValue          decimal
  transferStatus      enum: organizado | pendente
  transferProvider    string, nullable
  transferScheduledAt timestamp, nullable
  transferNotes       text, nullable
  createdAt           timestamp
  updatedAt           timestamp
  createdByUserId     uuid, FK -> StaffUser, nullable   -- nulo quando source = site
```

Distinção entre os dois status intermediários (consistente com a política de cancelamento já publicada no site: sinal de 50% na confirmação, saldo até 15 dias antes do check-in): `aguardando_sinal` — nada foi pago ainda, a reserva existe mas o sinal de 50% não chegou; `aguardando_pagamento` — o sinal já foi confirmado, falta o saldo restante. "Disponível" no calendário não é um valor deste enum — é a ausência de qualquer reserva cobrindo aquele dia.

Nota de compatibilidade com a Fundação: a spec da Fundação usa `status: pending | confirmed | declined | cancelled | pending_sync_error` para o ciclo de vida da reserva (confirmação via Google Calendar) e não tem campo de pagamento. Quando a Integração acontecer, `Reservation` ganha os campos da Fundação (`googleEventId`, timestamps de notificação) e os dois enums de status (ciclo de vida vs. pagamento) convivem como colunas independentes — uma reserva pode estar `confirmed` no Calendar e `aguardando_pagamento` no financeiro ao mesmo tempo. Isso já está previsto no desenho para não exigir uma reformulação do schema depois.

## Telas

Todas dentro do menu lateral fixo (logo + 5 itens: Visão Geral, Calendário, Reservas, Financeiro, Tarifário), cabeçalho com nome do usuário logado e botão de sair.

### 1. Visão geral (`/painel`)

- Cards de resumo: reservas do mês corrente, valor total a receber.
- Lista em destaque de reservas com `status` em `aguardando_sinal` ou `aguardando_pagamento`, ordenada por check-in mais próximo primeiro — é o "alerta de pagamento pendente".
- Contador (badge) com a mesma contagem replicado ao lado do item "Reservas" no menu.

### 2. Calendário (`/painel/calendario`)

- Visão mensal (navegação mês anterior/próximo), cada dia com fundo suave e borda colorida conforme o `status` da reserva que ocupa aquela data (verde = pago, laranja = aguardando sinal, vermelho = aguardando pagamento, sem cor = disponível).
- Clicar num dia com reserva abre um painel lateral com o resumo da reserva e um link para a tela de edição completa em Reservas.

### 3. Reservas (`/painel/reservas`)

- Tabela com todas as reservas (passadas e futuras — dobra como o histórico de hóspedes pedido), colunas: hóspede, período, pacote, status de pagamento, status de traslado, valor.
- Busca por nome do hóspede; filtro por período e por status.
- Botão "Nova reserva" abre formulário: hóspede (nome, e-mail, telefone), período (check-in/check-out), pacote, número de hóspedes, valor total, status de pagamento, observações.
- Cada linha é editável: além dos campos do formulário, a edição inclui o bloco de traslado (status organizado/pendente, fornecedor contratado, horário combinado, observações).

### 4. Financeiro (`/painel/financeiro`)

- "Valores a receber": soma de `totalValue` de todas as reservas com status diferente de `pago`, com lista detalhada (hóspede, valor, data de check-in).
- "Provisionamento": seletor de período (um mês específico, ou um dia específico), mostrando a soma de `totalValue` das reservas cujo check-in cai naquele período, separado por status de pagamento.

### 5. Tarifário (`/painel/tarifario`)

- Lista dos 4 pacotes, cada um editável inline ou em formulário: nome, descrição, preços por temporada (baixa/alta/especial), ativo/inativo.
- Toda alteração salva atualiza a tabela `Package` imediatamente — a leitura pelo site público fica para o sub-projeto de Integração, mas o dado já fica correto e persistido desde já.

## Autenticação e segurança — fluxo

1. **Cadastro de usuário** (feito manualmente por quem administra, sem tela de auto-cadastro pública): cria `StaffUser` com e-mail e senha; no primeiro login, o sistema força o setup do 2FA (mostra o QR code, usuário escaneia e confirma um código para ativar `totpEnabledAt`).
2. **Login**: e-mail + senha → se corretos e `totpEnabledAt` preenchido, pede o código TOTP → sessão criada. Se `totpEnabledAt` for nulo, força o setup do 2FA antes de liberar qualquer tela do painel.
3. **Toda rota sob `/painel`** passa por um middleware que exige sessão válida; sem sessão, redireciona para `/painel/login`.
4. **Logout** invalida a sessão (remove o cookie).

## Dados de exemplo (seed)

Script (`prisma/seed.ts`) que popula:
- Os 4 pacotes reais já com os preços atuais do site (Rio Negro, Macucus, Ajuricaba, Pouso).
- 15–20 reservas fictícias distribuídas entre passado e futuro, cobrindo os três status de pagamento e ambos os status de traslado, com nomes de hóspede fictícios — o suficiente para o calendário, a lista de reservas e o financeiro parecerem povoados numa demonstração.
- Um `StaffUser` de exemplo para o cliente testar o login (senha definida no momento da execução do seed, não hardcoded no código-fonte).

## Erros e casos extremos

- Login com senha ou código TOTP errados repetidamente → bloqueio temporário (rate limit), mensagem genérica (não revela se o e-mail existe ou se foi a senha ou o TOTP que falhou, para não vazar informação a um atacante).
- Edição de reserva com datas que se sobrepõem a outra reserva já `pago` ou `aguardando_pagamento` → alerta visual no formulário, mas não bloqueia o salvamento (o gestor pode ter um motivo válido; a decisão final é humana, mesmo padrão adotado na Fundação para os convites do Calendar).
- Exclusão de reserva → soft delete (campo `deletedAt`, não remoção física), para preservar o histórico financeiro mesmo se algo for apagado por engano.

## Testes

- Testes de unidade da lógica de cálculo do financeiro (valores a receber, soma por período de provisionamento).
- Testes do fluxo de autenticação: geração/validação do código TOTP, rate limiting do login — maior superfície de risco de segurança deste sub-projeto, prioridade de cobertura.
- Teste de integração das rotas de CRUD de reserva e de pacote (banco de teste, sem mocks de serviços externos, já que não há nenhum nesta fase).
- Teste manual ponta a ponta com os dados de seed: login completo (senha + TOTP), criar reserva manual, editar status de pagamento e traslado, ver refletido no calendário e no financeiro, editar um pacote no tarifário.

## Fora de escopo (fica para o sub-projeto de Integração)

- Sincronização real com Google Calendar.
- Site público lendo o tarifário do banco (por ora o site continua com `content/packages.ts` estático).
- Perfis de permissão diferenciados entre usuários da equipe.
- Qualquer processamento ou emissão de cobrança de pagamento.
- CMS de páginas de experiências (adiado pelo cliente).

## Custo mensal adicional deste sub-projeto

Nenhum — usa o mesmo Neon Postgres (free tier) e a mesma hospedagem Vercel já previstos. Não introduz nenhum serviço pago novo.
