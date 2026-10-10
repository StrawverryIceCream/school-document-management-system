import DashboardHero from "@/components/dashboard/DashboardHero";

import AvailableDocuments from "@/components/home/AvailableDocuments";
import MyRequestCards from "@/components/my_request/MyRequestCards";
import RequestsSection from "@/components/my_request/RequestSection";

import { useAuth } from "@/hooks/useAuth";
import { useSearchShortcut } from "@/hooks/useSearchShortcut";
import type { DocumentTypeItem } from "@/lib/document";
import { getGreeting } from "@/lib/home";
import { BadgeCheck, Award, FileText, Star } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const FEATURED_DOCUMENTS: DocumentTypeItem[] = [
  {
    id: "tor",
    title: "Transcript of Records",
    description: "Comprehensive academic transcript with certified grades.",
    price: 150,
    turnaround: "3–5 working days",
    isExpress: false,
    icon: FileText,
    tone: "rose",
  },
  {
    id: "coe",
    title: "Cert. of Enrollment (COE)",
    description: "Affirmation of active student matriculation for scholarship.",
    price: 50,
    turnaround: "1–2 working days",
    isExpress: true,
    icon: BadgeCheck,
    tone: "stone",
  },
  {
    id: "tcg",
    title: "True Copy of Grades (TCG)",
    description: "Official per-semester academic assessment and grades.",
    price: 50,
    turnaround: "1–2 working days",
    isExpress: false,
    icon: Star,
    tone: "orange",
  },
  {
    id: "gmc",
    title: "Certificate of Good Moral",
    description:
      "Office of Student Affairs certification confirming ethical conduct.",
    price: 50,
    turnaround: "2 working days",
    isExpress: false,
    icon: Award,
    tone: "sky",
  },
];

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useSearchShortcut(searchInputRef);

  function handleSearchSubmit() {
    const query = searchQuery.trim();
    if (!query) return;
    console.log(`/requests?search=${encodeURIComponent(query)}`);
  }

  return (
    <div className="h-full overflow-hidden p-6 sm:p-10">
      <div className="mx-auto h-full flex flex-col gap-8">
        <DashboardHero
          greeting={getGreeting()}
          userName={user?.fullName ?? ""}
          portalLabel="Administrative Records and Coordination Hub"
          academicYear="AY 2026–2027"
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          searchInputRef={searchInputRef}
        />
        <AvailableDocuments
          documents={FEATURED_DOCUMENTS}
          totalCount={8}
          exploreHref="/documents"
          onApply={(documentId) =>
            navigate(`/requests/new?document=${documentId}`)
          }
        />

        <MyRequestCards />
        <RequestsSection />
      </div>
    </div>
  );
}

export default Home;
