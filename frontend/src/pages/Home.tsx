import DashboardHero from "@/components/home/DashboardHero";
import AvailableDocuments from "@/components/home/AvailableDocuments";
import MyRequestCards from "@/components/requests/my/MyRequestCards";
import RequestsSection from "@/components/requests/my/RequestSection";
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
    const target =
      user?.role === "admin" || user?.role === "staff"
        ? "/all-request"
        : "/my-request";
    navigate(`${target}?search=${encodeURIComponent(query)}`);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
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
  );
}

export default Home;
