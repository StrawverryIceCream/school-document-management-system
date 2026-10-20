import { useState } from "react";
import { useInRouterContext, useSearchParams } from "react-router-dom";
import { Building2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface OfficeSwitcherProps {
  userOfficeCode?: string;
  isSectorHead?: boolean;
  isAdmin?: boolean;
  childOffices?: string[];
  onOfficeChange?: (officeCode: string) => void;
}

const SECTOR_HEAD_CODES = ["OVPAA", "OVPAF", "OVPRE", "OVPPDSC", "OUP"];

const SECTORS_WITH_OFFICES = [
  {
    sector: "OVPAA (Academic Affairs)",
    code: "OVPAA",
    offices: ["OUR", "OAD", "OSA", "OGS", "IRJP", "ULLR", "NSTP"],
  },
  {
    sector: "Colleges",
    code: "COL",
    offices: ["COE", "CIT", "CIE", "COS", "CAFA", "CLA"],
  },
  {
    sector: "OVPAF (Admin & Finance)",
    code: "OVPAF",
    offices: ["HRMO", "RMO", "PO", "SPO", "AUX", "MDS", "AO", "BO", "CO", "CSO"],
  },
  {
    sector: "OVPRE (Research & Extension)",
    code: "OVPRE",
    offices: ["URDS", "TLO-ITSO"],
  },
  {
    sector: "OVPPDSC (Planning & Dev)",
    code: "OVPPDSC",
    offices: ["PDO", "IMDO", "QAASO"],
  },
  {
    sector: "Executive Offices",
    code: "OUP",
    offices: ["OUP", "OBS", "BAC"],
  },
];

function getDefaultChildOffices(sectorCode: string): string[] {
  const match = SECTORS_WITH_OFFICES.find((s) => s.code === sectorCode);
  return match ? match.offices : [];
}

function RouterOfficeSwitcher({
  userOfficeCode = "OUR",
  isSectorHead,
  isAdmin = false,
  childOffices,
  onOfficeChange,
}: OfficeSwitcherProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedOffice = searchParams.get("officeCode") || (isAdmin ? "ALL" : userOfficeCode);

  const isHead =
    isSectorHead !== undefined
      ? isSectorHead
      : SECTOR_HEAD_CODES.includes(userOfficeCode);

  const effectiveChildOffices =
    childOffices && childOffices.length > 0
      ? childOffices
      : getDefaultChildOffices(userOfficeCode);

  const handleSelect = (code: string) => {
    if (onOfficeChange) onOfficeChange(code);
    const params = new URLSearchParams(searchParams);
    if (code === "ALL") {
      params.delete("officeCode");
    } else {
      params.set("officeCode", code);
    }
    setSearchParams(params);
  };

  if (isAdmin) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
            <Building2 className="size-3.5 text-primary" />
            <span>
              Scope: <span className="font-semibold text-primary">{selectedOffice}</span>
            </span>
            <ChevronDown className="size-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 max-h-[75vh] overflow-y-auto">
          <DropdownMenuItem onClick={() => handleSelect("ALL")}>
            <span className="font-semibold text-primary">All Offices (Institution-wide)</span>
          </DropdownMenuItem>
          {SECTORS_WITH_OFFICES.map((group) => (
            <div key={group.code} className="py-1">
              <div className="px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/40">
                {group.sector}
              </div>
              <DropdownMenuItem onClick={() => handleSelect(group.code)} className="font-medium text-primary">
                Entire Sector ({group.code})
              </DropdownMenuItem>
              {group.offices.map((off) => (
                <DropdownMenuItem key={off} onClick={() => handleSelect(off)} className="pl-4 text-xs">
                  {off}
                </DropdownMenuItem>
              ))}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (!isHead) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 text-xs font-medium text-muted-foreground border">
        <Building2 className="size-3.5" />
        <span>Office: {userOfficeCode}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
          <Building2 className="size-3.5 text-primary" />
          <span>
            Sector: {userOfficeCode}
            {selectedOffice && selectedOffice !== userOfficeCode && (
              <span className="font-semibold text-primary ml-1">
                ({selectedOffice})
              </span>
            )}
          </span>
          <ChevronDown className="size-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-[75vh] overflow-y-auto">
        <DropdownMenuItem onClick={() => handleSelect(userOfficeCode)}>
          All Units ({userOfficeCode})
        </DropdownMenuItem>
        {effectiveChildOffices.map((office) => (
          <DropdownMenuItem key={office} onClick={() => handleSelect(office)}>
            {office}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StandaloneOfficeSwitcher({
  userOfficeCode = "OUR",
  isSectorHead,
  isAdmin = false,
  childOffices,
  onOfficeChange,
}: OfficeSwitcherProps) {
  const [selectedOffice, setSelectedOffice] = useState(isAdmin ? "ALL" : userOfficeCode);

  const isHead =
    isSectorHead !== undefined
      ? isSectorHead
      : SECTOR_HEAD_CODES.includes(userOfficeCode);

  const effectiveChildOffices =
    childOffices && childOffices.length > 0
      ? childOffices
      : getDefaultChildOffices(userOfficeCode);

  const handleSelect = (code: string) => {
    setSelectedOffice(code);
    if (onOfficeChange) onOfficeChange(code);
  };

  if (isAdmin) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
            <Building2 className="size-3.5 text-primary" />
            <span>
              Scope: <span className="font-semibold text-primary">{selectedOffice}</span>
            </span>
            <ChevronDown className="size-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 max-h-[75vh] overflow-y-auto">
          <DropdownMenuItem onClick={() => handleSelect("ALL")}>
            <span className="font-semibold text-primary">All Offices (Institution-wide)</span>
          </DropdownMenuItem>
          {SECTORS_WITH_OFFICES.map((group) => (
            <div key={group.code} className="py-1">
              <div className="px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/40">
                {group.sector}
              </div>
              <DropdownMenuItem onClick={() => handleSelect(group.code)} className="font-medium text-primary">
                Entire Sector ({group.code})
              </DropdownMenuItem>
              {group.offices.map((off) => (
                <DropdownMenuItem key={off} onClick={() => handleSelect(off)} className="pl-4 text-xs">
                  {off}
                </DropdownMenuItem>
              ))}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (!isHead) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 text-xs font-medium text-muted-foreground border">
        <Building2 className="size-3.5" />
        <span>Office: {userOfficeCode}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
          <Building2 className="size-3.5 text-primary" />
          <span>
            Sector: {userOfficeCode}
            {selectedOffice && selectedOffice !== userOfficeCode && (
              <span className="font-semibold text-primary ml-1">
                ({selectedOffice})
              </span>
            )}
          </span>
          <ChevronDown className="size-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-[75vh] overflow-y-auto">
        <DropdownMenuItem onClick={() => handleSelect(userOfficeCode)}>
          All Units ({userOfficeCode})
        </DropdownMenuItem>
        {effectiveChildOffices.map((office) => (
          <DropdownMenuItem key={office} onClick={() => handleSelect(office)}>
            {office}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function OfficeSwitcher(props: OfficeSwitcherProps) {
  const inRouter = useInRouterContext();
  if (inRouter) {
    return <RouterOfficeSwitcher {...props} />;
  }
  return <StandaloneOfficeSwitcher {...props} />;
}
