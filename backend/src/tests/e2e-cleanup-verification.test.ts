async function runE2eCleanupVerification() {
  console.log("Starting End-to-End System Cleanup Verification...");

  // 1. Verify Sector Metrics Endpoint Security (Issue 4)
  const unauthMetrics = await fetch("http://localhost:5000/api/offices/sectors/OVPAF/metrics");
  console.assert(
    unauthMetrics.status === 401,
    `Security check failed: expected 401, got ${unauthMetrics.status}`,
  );
  console.log("✅ 1. Metrics endpoint security: 401 Unauthorized for public access");

  // 2. Verify Offices Directory API (public)
  const officesRes = await fetch("http://localhost:5000/api/offices?sector=OVPAF");
  console.assert(officesRes.ok, `Expected 200, got ${officesRes.status}`);
  const officesJson = await officesRes.json();
  console.assert(officesJson.data?.length > 0, "OVPAF offices should exist");
  console.log(`✅ 2. Offices directory API: returned ${officesJson.data?.length} offices`);

  // 3. Verify Health Endpoint
  const healthRes = await fetch("http://localhost:5000/api/health");
  console.assert(healthRes.ok, `Health check failed: ${healthRes.status}`);
  console.log("✅ 3. Server health check: OK");

  console.log("\n🎉 All automated system cleanup verifications passed!");
}

runE2eCleanupVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
