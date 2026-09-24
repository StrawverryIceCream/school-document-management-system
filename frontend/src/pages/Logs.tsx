import LogsHeader from "@/components/logs/LogsHeader";

function Logs() {
  return (
    <div className="h-full overflow-hidden p-6 sm:p-10">
      <div className="mx-auto h-full flex flex-col">
        <LogsHeader />
      </div>
    </div>
  );
}

export default Logs;
