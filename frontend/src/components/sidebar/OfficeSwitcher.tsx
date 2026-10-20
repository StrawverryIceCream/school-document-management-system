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
  childOffices?: string[];
  onOfficeChange?: (officeCode: string) => void;
}

const SECTOR_HEAD_CODES = ["OVPAA", "OVPAF", "OVPRE", "OVPPDSC", "OUP"];

function RouterOfficeSwitcher({
  userOfficeCode = "OUR",
  isSectorHead,
  childOffices = [],
  onOfficeChange,
}: OfficeSwitcherProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedOffice = searchParams.get("officeCode") || userOfficeCode;

  const isHead =
    isSectorHead !== undefined
      ? isSectorHead
      : SECTOR_HEAD_CODES.includes(userOfficeCode);

  const handleSelect = (code: string) => {
    if (onOfficeChange) onOfficeChange(code);
    const params = new URLSearchParams(searchParams);
    if (code === "ALL" || code === userOfficeCode) {
      params.delete("officeCode");
    } else {
      params.set("officeCode", code);
    }
    setSearchParams(params);
  };

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
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleSelect(userOfficeCode)}>
          All Units ({userOfficeCode})
        </DropdownMenuItem>
        {childOffices.map((office) => (
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
  childOffices = [],
  onOfficeChange,
}: OfficeSwitcherProps) {
  const [selectedOffice, setSelectedOffice] = useState(userOfficeCode);

  const isHead =
    isSectorHead !== undefined
      ? isSectorHead
      : SECTOR_HEAD_CODES.includes(userOfficeCode);

  const handleSelect = (code: string) => {
    setSelectedOffice(code);
    if (onOfficeChange) onOfficeChange(code);
  };

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
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleSelect(userOfficeCode)}>
          All Units ({userOfficeCode})
        </DropdownMenuItem>
        {childOffices.map((office) => (
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
