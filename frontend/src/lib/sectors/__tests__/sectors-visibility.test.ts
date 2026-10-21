import { filterActiveSectors, isOfficeActive } from "../sectors-visibility";
import type { SectorConfig } from "../sectors-config";

const mockSectors: SectorConfig[] = [
  {
    id: "sec1",
    code: "SEC1",
    name: "Sector 1",
    shortName: "S1",
    description: "Desc",
    icon: {} as any,
    bannerTone: "teal",
    divisions: [
      {
        id: "div1",
        name: "Division 1",
        description: "D1",
        offices: [
          { id: "off1", code: "OFF1", name: "Office 1", description: "", icon: {} as any, bannerTone: "teal", iconTone: "neutral" },
          { id: "off2", code: "OFF2", name: "Office 2", description: "", icon: {} as any, bannerTone: "teal", iconTone: "neutral" },
        ],
      },
      {
        id: "div2",
        name: "Division 2",
        description: "D2",
        offices: [
          { id: "off3", code: "OFF3", name: "Office 3", description: "", icon: {} as any, bannerTone: "teal", iconTone: "neutral" },
        ],
      },
    ],
  },
  {
    id: "sec2",
    code: "SEC2",
    name: "Sector 2",
    shortName: "S2",
    description: "Empty Sector",
    icon: {} as any,
    bannerTone: "bronze",
    divisions: [
      {
        id: "div3",
        name: "Division 3",
        description: "D3",
        offices: [
          { id: "off4", code: "OFF4", name: "Office 4", description: "", icon: {} as any, bannerTone: "bronze", iconTone: "neutral" },
        ],
      },
    ],
  },
];

function runTests() {
  console.log("Running sectors-visibility unit tests...");

  // Test 1: Only OFF1 has active documents -> only sec1 -> div1 -> OFF1 is visible
  const activeCodes = new Set(["OFF1"]);
  const filtered = filterActiveSectors(mockSectors, activeCodes, false);
  console.assert(filtered.length === 1, "Only 1 sector should be visible");
  console.assert(filtered[0].id === "sec1", "Expected sec1");
  console.assert(filtered[0].divisions.length === 1, "Only 1 division should be visible");
  console.assert(filtered[0].divisions[0].id === "div1", "Expected div1");
  console.assert(filtered[0].divisions[0].offices.length === 1, "Only 1 office should be visible");
  console.assert(filtered[0].divisions[0].offices[0].code === "OFF1", "Expected OFF1");

  // Test 2: showInactive = true shows all units
  const allUnits = filterActiveSectors(mockSectors, activeCodes, true);
  console.assert(allUnits.length === 2, "All 2 sectors should be visible when showInactive=true");
  console.assert(allUnits[0].divisions.length === 2, "Expected 2 divisions");
  console.assert(allUnits[1].divisions.length === 1, "Expected 1 division");

  // Test 3: isOfficeActive case insensitivity
  console.assert(isOfficeActive({ code: "OFF1" } as any, activeCodes) === true, "Expected active");
  console.assert(isOfficeActive({ code: "off1" } as any, activeCodes) === true, "Expected active");
  console.assert(isOfficeActive({ code: "OFF2" } as any, activeCodes) === false, "Expected inactive");

  console.log("✅ All sectors-visibility unit tests passed!");
}

runTests();
