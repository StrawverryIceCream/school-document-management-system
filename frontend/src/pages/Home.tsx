import DashboardHero from "@/components/home/DashboardHero";
import AvailableDocuments from "@/components/home/AvailableDocuments";
import MyRequestCards from "@/components/my_request/MyRequestCards";
import RequestsSection from "@/components/my_request/RequestSection";
import { useAuth } from "@/hooks/useAuth";
import { useSearchShortcut } from "@/hooks/useSearchShortcut";
import { getGreeting } from "@/lib/home";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
          exploreHref="/documents"
          onApply={(documentId) => navigate(`/new-request/${documentId}`)}
        />

        <MyRequestCards />
        <RequestsSection />
      </div>
    </div>
  );
}

export default Home;
