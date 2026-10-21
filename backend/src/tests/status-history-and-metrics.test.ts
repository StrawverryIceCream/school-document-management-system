async function testMetricsAndHistory() {
  const start = Date.now();
  const res = await fetch("http://localhost:5000/api/offices?sector=OVPAA");
  if (!res.ok) throw new Error(`API failed: ${res.status}`);
  const json = await res.json();
  const duration = Date.now() - start;

  console.assert(json.data.length > 0, "OVPAA offices must exist");
  console.log(`✅ Sector offices query response time: ${duration}ms, count: ${json.data.length}`);
}

testMetricsAndHistory().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
