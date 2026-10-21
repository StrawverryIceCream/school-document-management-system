async function run() {
  const sectors = ['OUP', 'OVPAA', 'OVPAF', 'OVPRE', 'OVPPDSC'];
  for (const s of sectors) {
    const r1 = await fetch('http://localhost:5000/api/offices?sector=' + s);
    if (!r1.ok) throw new Error(`Failed GET /api/offices?sector=${s}: ${r1.status}`);
    const j1 = await r1.json();

    const r2 = await fetch('http://localhost:5000/api/offices/sectors/' + s + '/metrics');
    if (!r2.ok) throw new Error(`Failed GET /api/offices/sectors/${s}/metrics: ${r2.status}`);
    const j2 = await r2.json();

    console.log(`✅ Sector ${s}: ${j1.data?.length ?? 0} offices listed, metrics returned for ${j2.offices?.length ?? 0} offices`);
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  });
