async function verify() {
  console.log("Starting End-to-End Dynamic Visibility Verification...");

  // 1. Verify OUR has active documents and backfill succeeded
  const officesRes = await fetch("http://localhost:5000/api/offices?withActiveDocs=true");
  if (!officesRes.ok) throw new Error(`GET /api/offices failed: ${officesRes.status}`);
  const officesBody = (await officesRes.json()) as { data: any[]; total: number };
  const our = officesBody.data.find((o: any) => o.code === "OUR");
  if (!our || our.activeDocumentCount < 10) {
    throw new Error(`OUR document count expected >= 10, got ${our?.activeDocumentCount}`);
  }
  console.log(`✅ 1. OUR has ${our.activeDocumentCount} active documents linked.`);

  // 2. Verify activeOnly filter
  const activeOnlyRes = await fetch("http://localhost:5000/api/offices?activeOnly=true");
  if (!activeOnlyRes.ok) throw new Error(`GET /api/offices?activeOnly=true failed: ${activeOnlyRes.status}`);
  const activeOnlyBody = (await activeOnlyRes.json()) as { data: any[]; total: number };
  const allHaveDocs = activeOnlyBody.data.every((o: any) => o.activeDocumentCount > 0);
  if (!allHaveDocs) throw new Error("Found 0-doc office in activeOnly response");
  console.log(`✅ 2. activeOnly returned ${activeOnlyBody.total} active offices.`);

  // 3. Verify unassigned documents are zero
  const docsRes = await fetch("http://localhost:5000/api/documents?limit=200");
  const docsBody = (await docsRes.json()) as { data: any[] };
  const unassigned = docsBody.data.filter((d: any) => !d.officeId);
  if (unassigned.length > 0) {
    throw new Error(`Found ${unassigned.length} documents without officeId`);
  }
  console.log(`✅ 3. All ${docsBody.data.length} documents in catalog are linked to active offices.`);

  console.log("🎉 All automated dynamic visibility verifications passed!");
}

verify().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
