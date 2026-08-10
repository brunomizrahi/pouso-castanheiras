// dc.html 755-764: iframe embedding public/route-map.html (Task 3), a self-contained
// Leaflet/OpenStreetMap page — no API key needed. Exact style per the plan's Step 2.
export function RouteMap() {
  return (
    <iframe
      src="/route-map.html"
      title="Mapa do trajeto Manaus–Novo Airão–Pouso das Castanheiras"
      style={{ width: '100%', height: 'clamp(380px, 58vh, 620px)', border: 0, display: 'block' }}
    />
  );
}
