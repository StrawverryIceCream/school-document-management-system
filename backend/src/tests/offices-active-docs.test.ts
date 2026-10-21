async function runTest() {
  console.log("Testing office active document aggregation...");

  const res = await fetch("http://localhost:5000/api/offices?withActiveDocs=true");
  if (!res.ok) throw new Error(`API failed with status ${res.status}`);

  const body = (await res.json()) as {
    data: Array<{ code: string; activeDocumentCount: number }>;
  };

  if (!Array.isArray(body.data) || body.data.length === 0) {
    throw new Error("Expected non-empty offices list");
  }

  const ourOffice = body.data.find((o) => o.code === "OUR");
  if (!ourOffice) throw new Error("OUR office not found in response");
  if (typeof ourOffice.activeDocumentCount !== "number" || ourOffice.activeDocumentCount < 10) {
    throw new Error(`Expected OUR activeDocumentCount >= 10, got ${ourOffice.activeDocumentCount}`);
  }

  // Test activeOnly filter
  const activeOnlyRes = await fetch("http://localhost:5000/api/offices?activeOnly=true");
  const activeOnlyBody = (await activeOnlyRes.json()) as {
    data: Array<{ code: string; activeDocumentCount: number }>;
  };

  const hasEmptyOffices = activeOnlyBody.data.some((o) => o.activeDocumentCount === 0);
  if (hasEmptyOffices) {
    throw new Error("activeOnly=true returned offices with 0 active documents");
  }

  console.log("✅ Office active document aggregation passed!");
}

runTest().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
