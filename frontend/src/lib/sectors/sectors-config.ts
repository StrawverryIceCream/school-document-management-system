import {
  Building2,
  BuildingComplex,
  Compass,
  GraduationCap,
  Landmark,
  Microscope,
  Wallet,
  Users,
  FileText,
  ShieldCheck,
  Scale,
  Sparkles,
  FlaskConical,
  Cog,
  PencilRuler,
  TrendingUp,
  SquareTerminal,
  BookOpen,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import type { BannerTone, Tone } from "@/lib/tones";

export type OfficeConfig = {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: LucideIcon;
  bannerTone: BannerTone;
  iconTone: Tone;
  docCodePrefix?: string;
  collegeCode?: string;
  departmentMatch?: string;
};

export type DivisionConfig = {
  id: string;
  name: string;
  description: string;
  offices: OfficeConfig[];
};

export type SectorConfig = {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  icon: LucideIcon;
  bannerTone: BannerTone;
  divisions: DivisionConfig[];
};

export const SECTORS: SectorConfig[] = [
  {
    id: "oup",
    code: "OUP",
    name: "Office of the University President",
    shortName: "President & Board",
    description: "Executive governance, board resolutions, and direct presidential units",
    icon: Building2,
    bannerTone: "bronze",
    divisions: [
      {
        id: "governance",
        name: "Governance & Board",
        description: "Board of Regents and University Secretary",
        offices: [
          {
            id: "bor",
            code: "BOR",
            name: "Board of Regents",
            description: "Governing board resolutions, executive approvals, and policy orders",
            icon: Landmark,
            bannerTone: "crimson",
            iconTone: "neutral",
            departmentMatch: "Board of Regents",
          },
          {
            id: "obs",
            code: "OBS",
            name: "Office of the Board Secretary",
            description: "Board records, secretary certifications, and official minutes",
            icon: Scale,
            bannerTone: "bronze",
            iconTone: "neutral",
            docCodePrefix: "OBS",
            departmentMatch: "Office of the Board Secretary",
          },
        ],
      },
      {
        id: "direct",
        name: "Direct Presidential Units",
        description: "Internal audit, linkages, and procurement committees",
        offices: [
          {
            id: "ico",
            code: "ICO",
            name: "Internal Control Office",
            description: "Audit compliance, internal reviews, and regulatory accountability",
            icon: ShieldCheck,
            bannerTone: "slate",
            iconTone: "neutral",
            docCodePrefix: "ICO",
            departmentMatch: "Internal Control Office",
          },
          {
            id: "bac",
            code: "BAC",
            name: "Bids & Awards Committee",
            description: "Procurement bidding, equipment tenders, and vendor awards",
            icon: Briefcase,
            bannerTone: "mauve",
            iconTone: "neutral",
            docCodePrefix: "BAC",
            departmentMatch: "Bids & Awards Committee",
          },
          {
            id: "iileao",
            code: "IILEAO",
            name: "Institutional Linkages & External Affairs",
            description: "MOAs, international partnerships, and institutional exchanges",
            icon: Compass,
            bannerTone: "teal",
            iconTone: "neutral",
            docCodePrefix: "IILEAO",
            departmentMatch: "Institutional Linkages & External Affairs Office",
          },
        ],
      },
    ],
  },
  {
    id: "ovpaa",
    code: "OVPAA",
    name: "Vice President for Academic Affairs",
    shortName: "Academic Affairs",
    description: "Academic colleges, registrar services, student affairs, and admissions",
    icon: GraduationCap,
    bannerTone: "teal",
    divisions: [
      {
        id: "colleges",
        name: "Academic Colleges",
        description: "Instructional colleges and faculty departments",
        offices: [
          {
            id: "cos",
            code: "COS",
            name: "College of Science",
            description: "Natural sciences, computer studies, math & chemistry",
            icon: FlaskConical,
            bannerTone: "crimson",
            iconTone: "neutral",
            collegeCode: "COS",
            docCodePrefix: "COS",
          },
          {
            id: "coe",
            code: "COE",
            name: "College of Engineering",
            description: "Mechanical, civil, electrical & electronics engineering",
            icon: Cog,
            bannerTone: "bronze",
            iconTone: "neutral",
            collegeCode: "COE",
            docCodePrefix: "COE",
          },
          {
            id: "cafa",
            code: "CAFA",
            name: "College of Architecture & Fine Arts",
            description: "Architecture, fine arts, and graphics design",
            icon: PencilRuler,
            bannerTone: "slate",
            iconTone: "neutral",
            collegeCode: "CAFA",
            docCodePrefix: "CAFA",
          },
          {
            id: "cla",
            code: "CLA",
            name: "College of Liberal Arts",
            description: "Management, multidisciplinary studies, and physical education",
            icon: TrendingUp,
            bannerTone: "mauve",
            iconTone: "neutral",
            collegeCode: "CLA",
            docCodePrefix: "CLA",
          },
          {
            id: "cit",
            code: "CIT",
            name: "College of Industrial Technology",
            description: "Industrial technology, electronics, automotive & mechanical tech",
            icon: SquareTerminal,
            bannerTone: "teal",
            iconTone: "neutral",
            collegeCode: "CIT",
            docCodePrefix: "CIT",
          },
          {
            id: "cie",
            code: "CIE",
            name: "College of Industrial Education",
            description: "Vocational pedagogies, student teaching, and teacher education",
            icon: GraduationCap,
            bannerTone: "forest",
            iconTone: "neutral",
            collegeCode: "CIE",
            docCodePrefix: "CIE",
          },
        ],
      },
      {
        id: "academic-support",
        name: "Academic Support & Student Services",
        description: "Registrar, admissions, student affairs, guidance, and library resources",
        offices: [
          {
            id: "our",
            code: "OUR",
            name: "Office of the University Registrar",
            description: "Transcripts, certifications, diplomas, CAV, and enrollment records",
            icon: FileText,
            bannerTone: "teal",
            iconTone: "neutral",
            docCodePrefix: "OUR",
          },
          {
            id: "osa",
            code: "OSA",
            name: "Office of Student Affairs",
            description: "Good moral certificates, student assistantships, and organization accreditation",
            icon: Users,
            bannerTone: "mauve",
            iconTone: "neutral",
            docCodePrefix: "OSA",
          },
          {
            id: "oad",
            code: "OAD",
            name: "Office of Admissions",
            description: "College entrance tests, notice of admission, and incoming student evaluation",
            icon: Sparkles,
            bannerTone: "bronze",
            iconTone: "neutral",
            docCodePrefix: "OAD",
          },
          {
            id: "ogs",
            code: "OGS",
            name: "Guidance Office",
            description: "Counseling clearances, exit interviews, and leave of absence requests",
            icon: Compass,
            bannerTone: "forest",
            iconTone: "neutral",
            docCodePrefix: "OGS",
          },
          {
            id: "irjp",
            code: "IRJP",
            name: "Industrial Relations & Job Placement",
            description: "Supervised Industrial Training (SIT/OJT) endorsements and job placement",
            icon: Briefcase,
            bannerTone: "slate",
            iconTone: "neutral",
            docCodePrefix: "IRJP",
          },
          {
            id: "ullr",
            code: "ULLR",
            name: "University Library & Learning Resources",
            description: "Library referrals, book returns, and library clearance sign-offs",
            icon: BookOpen,
            bannerTone: "crimson",
            iconTone: "neutral",
            docCodePrefix: "ULLR",
          },
          {
            id: "nstp",
            code: "NSTP",
            name: "National Service Training Program",
            description: "ROTC, CWTS, and LTS enlistment verification and serial numbering",
            icon: ShieldCheck,
            bannerTone: "forest",
            iconTone: "neutral",
            docCodePrefix: "NSTP",
          },
        ],
      },
    ],
  },
  {
    id: "ovpaf",
    code: "OVPAF",
    name: "Vice President for Administration and Finance",
    shortName: "Admin & Finance",
    description: "Human resources, records, procurement, accounting, and cashier operations",
    icon: Wallet,
    bannerTone: "mauve",
    divisions: [
      {
        id: "admin-services",
        name: "Administrative Services Division",
        description: "Personnel, archives, logistics, civil security, and medical clinic",
        offices: [
          {
            id: "hrmo",
            code: "HRMO",
            name: "Human Resource Management Office",
            description: "CSC leave applications, employee clearances, and service records",
            icon: Users,
            bannerTone: "mauve",
            iconTone: "neutral",
            docCodePrefix: "HRMO",
            departmentMatch: "Human Resource Management Office",
          },
          {
            id: "rmo",
            code: "RMO",
            name: "Records Management Office",
            description: "Archived TUP orders, special orders, and certified true copies",
            icon: FileText,
            bannerTone: "bronze",
            iconTone: "neutral",
            docCodePrefix: "RMO",
            departmentMatch: "Records Management Office",
          },
          {
            id: "po",
            code: "PO",
            name: "Procurement Office",
            description: "Purchase requests, purchase orders, and supplier canvass processing",
            icon: Briefcase,
            bannerTone: "slate",
            iconTone: "neutral",
            docCodePrefix: "PO",
            departmentMatch: "Procurement Office",
          },
          {
            id: "spo",
            code: "SPO",
            name: "Supply & Property Office",
            description: "Requisition and Issue Slips (RIS) and property pass slip clearance",
            icon: BuildingComplex,
            bannerTone: "teal",
            iconTone: "neutral",
            docCodePrefix: "SPO",
            departmentMatch: "Supply & Property Office",
          },
          {
            id: "aux",
            code: "AUX",
            name: "Auxiliary Services",
            description: "Permits for use of campus facilities, halls, AVRs, and dorms",
            icon: Building2,
            bannerTone: "forest",
            iconTone: "neutral",
            docCodePrefix: "AUX",
            departmentMatch: "Auxiliary Services",
          },
          {
            id: "mds",
            code: "MDS",
            name: "Medical and Dental Services",
            description: "Medical clearance, physical examination certificates, and clinic consults",
            icon: Sparkles,
            bannerTone: "crimson",
            iconTone: "neutral",
            docCodePrefix: "MDS",
            departmentMatch: "Medical and Dental Services",
          },
        ],
      },
      {
        id: "finance",
        name: "Financial Services Division",
        description: "Accounting, budget obligations, and cashier collections",
        offices: [
          {
            id: "ao",
            code: "AO",
            name: "Accounting Office",
            description: "Student clearances, tutorial assessments, and financial certifications",
            icon: Scale,
            bannerTone: "teal",
            iconTone: "neutral",
            docCodePrefix: "AO",
            departmentMatch: "Accounting Office",
          },
          {
            id: "bo",
            code: "BO",
            name: "Budget Office",
            description: "ORS/BURS processing, Certificates of Availability of Funds (CAF)",
            icon: Wallet,
            bannerTone: "bronze",
            iconTone: "neutral",
            docCodePrefix: "BO",
            departmentMatch: "Budget Office",
          },
          {
            id: "co",
            code: "CO",
            name: "Cashier's Office",
            description: "Official receipt verification, payment collections, and window slips",
            icon: Landmark,
            bannerTone: "forest",
            iconTone: "neutral",
            docCodePrefix: "CO",
            departmentMatch: "Cashier's Office",
          },
        ],
      },
    ],
  },
  {
    id: "ovpre",
    code: "OVPRE",
    name: "Vice President for Research and Extension",
    shortName: "Research & Extension",
    description: "University research, community extension, training center, and intellectual property",
    icon: Microscope,
    bannerTone: "slate",
    divisions: [
      {
        id: "research",
        name: "Research & Development",
        description: "Research outputs, similarity checks, and training centers",
        offices: [
          {
            id: "urds",
            code: "URDS",
            name: "University Research & Development Services",
            description: "Research clearances, similarity index verification, and encoding",
            icon: Microscope,
            bannerTone: "slate",
            iconTone: "neutral",
            docCodePrefix: "URDS",
            departmentMatch: "University Research and Development Services",
          },
          {
            id: "irtc",
            code: "IRTC",
            name: "Integrated Research & Training Center",
            description: "Specialized lab facilities, testing equipment, and technical seminars",
            icon: Sparkles,
            bannerTone: "teal",
            iconTone: "neutral",
            docCodePrefix: "IRTC",
            departmentMatch: "Integrated Research and Training Center",
          },
        ],
      },
      {
        id: "extension",
        name: "Extension & Technology Licensing",
        description: "Community outreach programs, patenting, and NDAs",
        offices: [
          {
            id: "ues",
            code: "UES",
            name: "University Extension Services",
            description: "Community development, extension program approvals, and certificates",
            icon: Users,
            bannerTone: "forest",
            iconTone: "neutral",
            docCodePrefix: "UES",
            departmentMatch: "University Extension Services",
          },
          {
            id: "itso",
            code: "TLO-ITSO",
            name: "Technology Licensing & Support Office",
            description: "Non-Disclosure Agreements (NDA), patent drafts, and copyright filings",
            icon: Scale,
            bannerTone: "bronze",
            iconTone: "neutral",
            docCodePrefix: "TLO",
            departmentMatch: "Technology Licensing Office",
          },
        ],
      },
    ],
  },
  {
    id: "ovppdsc",
    code: "OVPPDSC",
    name: "Vice President for Planning, Development & Special Concerns",
    shortName: "Planning & Dev",
    description: "Physical facilities planning, IT center, QMS accreditation, and gender development",
    icon: Compass,
    bannerTone: "forest",
    divisions: [
      {
        id: "planning",
        name: "Planning & Infrastructure",
        description: "Institutional data, FOI, and architectural blueprints",
        offices: [
          {
            id: "pdo",
            code: "PDO",
            name: "Planning and Development Office",
            description: "Freedom of Information (FOI) processing and university statistical data",
            icon: Compass,
            bannerTone: "forest",
            iconTone: "neutral",
            docCodePrefix: "PDO",
            departmentMatch: "Planning and Development Office",
          },
          {
            id: "imdo",
            code: "IMDO",
            name: "Infrastructure Management & Development Office",
            description: "Building designs, architectural working drawings, and campus renovations",
            icon: PencilRuler,
            bannerTone: "slate",
            iconTone: "neutral",
            docCodePrefix: "IMDO",
            departmentMatch: "Infrastructure Management and Development Office",
          },
        ],
      },
      {
        id: "it-quality",
        name: "IT & Quality Assurance",
        description: "Network services, document change notices, and gender development",
        offices: [
          {
            id: "uitc",
            code: "UITC",
            name: "University Information Technology Center",
            description: "Campus portal accounts, network access, and system development",
            icon: SquareTerminal,
            bannerTone: "teal",
            iconTone: "neutral",
            docCodePrefix: "UITC",
            departmentMatch: "University Information Technology Center",
          },
          {
            id: "qaaso",
            code: "QAASO",
            name: "Quality Assurance & Accreditation Office",
            description: "Standard form revisions (DCN), quality system procedures (QSP), and audits",
            icon: ShieldCheck,
            bannerTone: "crimson",
            iconTone: "neutral",
            docCodePrefix: "QAASO",
            departmentMatch: "Quality Assurance & Accreditation Services Office",
          },
        ],
      },
    ],
  },
];

export function getSector(sectorId: string): SectorConfig | undefined {
  return SECTORS.find((s) => s.id === sectorId.toLowerCase());
}

export function getDivision(
  sectorId: string,
  divisionId: string,
): DivisionConfig | undefined {
  return getSector(sectorId)?.divisions.find(
    (d) => d.id === divisionId.toLowerCase(),
  );
}

export function getOffice(
  sectorId: string,
  divisionId: string,
  officeId: string,
): OfficeConfig | undefined {
  return getDivision(sectorId, divisionId)?.offices.find(
    (o) => o.id === officeId.toLowerCase(),
  );
}

export interface OfficeRouteInfo {
  sectorId: string;
  divisionId: string;
  officeId: string;
  url: string;
  office: OfficeConfig;
}

export function findOfficeRoute(query: {
  officeId?: string | null;
  officeCode?: string | null;
  officeName?: string | null;
  sector?: string | null;
  documentTypeCode?: string | null;
  college?: string | null;
}): OfficeRouteInfo | undefined {
  const code = query.officeCode?.trim().toUpperCase();
  const id = query.officeId?.trim().toLowerCase();
  const name = query.officeName?.trim().toLowerCase();
  const docCode = query.documentTypeCode?.trim().toUpperCase();
  const college = query.college?.trim().toUpperCase();

  // Normalize common aliases
  const normalizedCode =
    code === "REGISTRAR" || code === "TOR"
      ? "OUR"
      : code === "HR" || code === "PERSONNEL"
        ? "HRMO"
        : code;

  for (const sector of SECTORS) {
    for (const division of sector.divisions) {
      for (const office of division.offices) {
        const offCode = office.code.toUpperCase();
        const offId = office.id.toLowerCase();
        const offName = office.name.toLowerCase();

        // 1. Direct code or ID match
        if (
          normalizedCode &&
          (offCode === normalizedCode || offId === normalizedCode.toLowerCase())
        ) {
          return {
            sectorId: sector.id,
            divisionId: division.id,
            officeId: office.id,
            url: `/sectors/${sector.id}/${division.id}/${office.id}`,
            office,
          };
        }

        // 2. ID match
        if (id && (offId === id || offCode.toLowerCase() === id)) {
          return {
            sectorId: sector.id,
            divisionId: division.id,
            officeId: office.id,
            url: `/sectors/${sector.id}/${division.id}/${office.id}`,
            office,
          };
        }

        // 3. Document type code prefix match (e.g. "OUR-001" starts with "OUR")
        if (
          docCode &&
          office.docCodePrefix &&
          docCode.startsWith(office.docCodePrefix.toUpperCase())
        ) {
          return {
            sectorId: sector.id,
            divisionId: division.id,
            officeId: office.id,
            url: `/sectors/${sector.id}/${division.id}/${office.id}`,
            office,
          };
        }

        // 4. College match (e.g. "COS" -> College of Science)
        if (
          college &&
          office.collegeCode &&
          college === office.collegeCode.toUpperCase()
        ) {
          return {
            sectorId: sector.id,
            divisionId: division.id,
            officeId: office.id,
            url: `/sectors/${sector.id}/${division.id}/${office.id}`,
            office,
          };
        }

        // 5. Name match
        if (
          name &&
          (offName === name || offName.includes(name) || name.includes(offName))
        ) {
          return {
            sectorId: sector.id,
            divisionId: division.id,
            officeId: office.id,
            url: `/sectors/${sector.id}/${division.id}/${office.id}`,
            office,
          };
        }
      }
    }
  }

  return undefined;
}
