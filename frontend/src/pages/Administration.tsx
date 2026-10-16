import AdministrationView from "@/components/administration/AdministrationView.tsx";
import { AdministrationViewProvider } from "@/provider/AdministrationViewProvider.tsx";

export default function Administration() {
  return (
    <AdministrationViewProvider>
      <AdministrationView />
    </AdministrationViewProvider>
  );
}

