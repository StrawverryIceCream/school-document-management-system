import AdministrationHeader from "@/components/administration/AdministrationHeader";
import AdministrationRequestTable from "@/components/administration/AdministrationRequestTable";
import AdministrationUnitCards from "@/components/administration/AdministrationUnitCards";
import { useAdministrationView } from "@/hooks/useAdministrationView";

export default function AdministrationView() {
  const { activeUnit } = useAdministrationView();

  return (
    <div className="h-full overflow-auto p-6 sm:p-10">
      <div className="mx-auto flex flex-col gap-8">
        {activeUnit ? (
          <AdministrationRequestTable />
        ) : (
          <>
            <AdministrationHeader />
            <AdministrationUnitCards />
          </>
        )}
      </div>
    </div>
  );
}