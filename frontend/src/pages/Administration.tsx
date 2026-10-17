import AdministrationView from "@/components/administration/AdministrationView";
import { AdministrationViewProvider } from "@/provider/AdministrationViewProvider";

export default function Administration() {
  return (
    <AdministrationViewProvider>
      <AdministrationView />
    </AdministrationViewProvider>
  );
}

