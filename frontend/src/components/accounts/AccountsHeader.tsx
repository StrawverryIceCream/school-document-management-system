function AccountsHeader() {
  return (
    <div className="mb-6 space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All accounts in the database
          </p>
        </div>
      </div>
    </div>
  );
}

export default AccountsHeader;
