import AdministrationHeader from "@/components/administration/AdministrationHeader";
import AdministrationRequestTable from "@/components/administration/AdministrationRequestTable";
import AdministrationUnitCards from "@/components/administration/AdministrationUnitCards";
import { useAdministrationView } from "@/hooks/useAdministrationView";

export default function AdministrationView() {
  const { activeUnit } = useAdministrationView();

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      {activeUnit ? (
        <AdministrationRequestTable />
      ) : (
        <>
          <AdministrationHeader />
          <AdministrationUnitCards />
        </>
      )}
    </div>
  );
}