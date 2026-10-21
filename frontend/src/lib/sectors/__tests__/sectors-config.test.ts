import { SECTORS, getSector, getDivision, getOffice } from "../sectors-config";

function runTests() {
  console.assert(SECTORS.length === 5, `Expected 5 sectors, got ${SECTORS.length}`);

  const ovpaf = getSector("ovpaf");
  console.assert(ovpaf !== undefined, "OVPAF sector must exist");
  console.assert(ovpaf?.divisions.length === 2, `Expected 2 divisions in OVPAF, got ${ovpaf?.divisions.length}`);

  const adminServices = getDivision("ovpaf", "admin-services");
  console.assert(adminServices !== undefined, "admin-services division must exist");

  const hrmo = getOffice("ovpaf", "admin-services", "hrmo");
  console.assert(hrmo?.code === "HRMO", `Expected HRMO code, got ${hrmo?.code}`);

  const ovpaa = getSector("ovpaa");
  const colleges = getDivision("ovpaa", "colleges");
  console.assert(colleges?.offices.length === 6, `Expected 6 colleges, got ${colleges?.offices.length}`);

  console.log("PASS: sectors-config assertions passed");
}

runTests();
