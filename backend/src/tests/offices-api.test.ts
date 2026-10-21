async function verifyOfficesApi() {
  const res = await fetch("http://localhost:5000/api/offices?sector=OVPAF");
  if (!res.ok) throw new Error(`API failed with status: ${res.status}`);
  const json = await res.json();
  console.assert(Array.isArray(json.data), "data must be an array");
  console.assert(json.data.length > 0, "Must return existing OVPAF offices");
  console.log("✅ Offices API verification passed! Count:", json.data.length);
}

verifyOfficesApi().catch((err) => {
  console.error("Test error:", err.message);
  process.exit(1);
});
