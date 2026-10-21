async function testRbacChecks() {
  const metricsRes = await fetch("http://localhost:5000/api/offices/sectors/OVPAF/metrics");
  console.assert(
    metricsRes.status === 401,
    `Expected 401 for unauthenticated metrics, got ${metricsRes.status}`,
  );
  if (metricsRes.status !== 401) {
    throw new Error(`Auth guard failed! Expected 401, got ${metricsRes.status}`);
  }
  console.log("✅ Metrics auth guard verification passed!");
}

testRbacChecks()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err.message);
    process.exit(1);
  });
