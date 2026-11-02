import AnnouncementBar from "@/components/landing/AnnouncementBar";
import CollegeOffices from "@/components/landing/CollegeWindows";
import CredentialsCatalog from "@/components/landing/CredentialsCatalog";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingHero from "@/components/landing/LandingHero";
import LandingNav from "@/components/landing/LandingNav";
import TrackRequest from "@/components/landing/TrackRequest";

export default function LandingPage() {
  return (
    <>
      <AnnouncementBar />
      <LandingNav />
      <main>
        <LandingHero />
        <CollegeOffices />
        <CredentialsCatalog />
        <TrackRequest />
      </main>
      <LandingFooter />
    </>
  );
}
