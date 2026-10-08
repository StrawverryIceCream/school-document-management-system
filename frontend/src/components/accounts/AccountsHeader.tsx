function AccountsHeader() {
  return (
    <div className="mb-8 flex items-start justify-between gap-5">
      <div>
        <h1 className="text-3xl font-bold tracking-normal">Accounts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          All accounts in the database
        </p>
      </div>
    </div>
  );
}

export default AccountsHeader;
