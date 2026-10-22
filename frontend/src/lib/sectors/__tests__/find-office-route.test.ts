import { findOfficeRoute } from "../sectors-config";

function runTests() {
  console.log("Running findOfficeRoute unit tests...");

  // 1. Direct code match: OUR
  const ourRoute = findOfficeRoute({ officeCode: "OUR" });
  console.assert(ourRoute !== undefined, "OUR office must resolve");
  console.assert(ourRoute?.sectorId === "ovpaa", `Expected sector ovpaa, got ${ourRoute?.sectorId}`);
  console.assert(ourRoute?.divisionId === "academic-support", `Expected academic-support, got ${ourRoute?.divisionId}`);
  console.assert(ourRoute?.officeId === "our", `Expected office id our, got ${ourRoute?.officeId}`);
  console.assert(
    ourRoute?.url === "/sectors/ovpaa/academic-support/our",
    `Expected URL /sectors/ovpaa/academic-support/our, got ${ourRoute?.url}`,
  );

  // 2. Direct code match: HRMO
  const hrmoRoute = findOfficeRoute({ officeCode: "HRMO" });
  console.assert(hrmoRoute !== undefined, "HRMO office must resolve");
  console.assert(hrmoRoute?.url === "/sectors/ovpaf/admin-services/hrmo", `Expected HRMO url, got ${hrmoRoute?.url}`);

  // 3. Document code prefix match: "OUR-001"
  const docPrefixRoute = findOfficeRoute({ documentTypeCode: "OUR-001" });
  console.assert(docPrefixRoute !== undefined, "OUR-001 document prefix must resolve to OUR");
  console.assert(docPrefixRoute?.officeId === "our", "Expected officeId our");

  // 4. College code match: "COS"
  const cosRoute = findOfficeRoute({ college: "COS" });
  console.assert(cosRoute !== undefined, "COS college must resolve to College of Science");
  console.assert(cosRoute?.url === "/sectors/ovpaa/colleges/cos", `Expected COS url, got ${cosRoute?.url}`);

  // 5. Common alias: "REGISTRAR" -> "OUR"
  const regRoute = findOfficeRoute({ officeCode: "REGISTRAR" });
  console.assert(regRoute?.officeId === "our", `Expected REGISTRAR alias to map to our, got ${regRoute?.officeId}`);

  // 6. Name match: "Office of the University Registrar"
  const nameRoute = findOfficeRoute({ officeName: "Office of the University Registrar" });
  console.assert(nameRoute?.officeId === "our", `Expected name match to map to our, got ${nameRoute?.officeId}`);

  // 7. Executive Sector code: OVPAF must resolve to OVPAF admin-services even if applicant college is CAFA
  const ovpafRoute = findOfficeRoute({
    officeCode: "OVPAF",
    documentTypeCode: "OVPAF-002",
    college: "CAFA",
  });
  console.assert(ovpafRoute !== undefined, "OVPAF office must resolve");
  console.assert(ovpafRoute?.sectorId === "ovpaf", `Expected sector ovpaf, got ${ovpafRoute?.sectorId}`);
  console.assert(ovpafRoute?.divisionId === "admin-services", `Expected admin-services, got ${ovpafRoute?.divisionId}`);
  console.assert(ovpafRoute?.officeId === "ovpaf", `Expected office id ovpaf, got ${ovpafRoute?.officeId}`);
  console.assert(
    ovpafRoute?.url === "/sectors/ovpaf/admin-services/ovpaf",
    `Expected URL /sectors/ovpaf/admin-services/ovpaf, got ${ovpafRoute?.url}`,
  );

  // 8. Explicit college document: COL with CAFA
  const collegeDocRoute = findOfficeRoute({
    officeCode: "COL",
    college: "CAFA",
  });
  console.assert(collegeDocRoute !== undefined, "COL with CAFA must resolve to CAFA");
  console.assert(collegeDocRoute?.url === "/sectors/ovpaa/colleges/cafa", `Expected CAFA url, got ${collegeDocRoute?.url}`);

  // 9. Unknown office returns undefined
  const unknownRoute = findOfficeRoute({ officeCode: "XYZ_NON_EXISTENT" });
  console.assert(unknownRoute === undefined, "Unknown office must return undefined");

  console.log("✅ All findOfficeRoute unit tests passed!");
}

runTests();
