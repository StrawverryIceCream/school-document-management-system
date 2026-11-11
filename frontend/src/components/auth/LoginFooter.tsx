import { ShieldCheck } from "lucide-react";

function LoginFooter() {
  return (
    <footer
      className="w-full border-t border-border/70 py-4 bg-muted/30"
      data-purpose="security-footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground font-medium">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          <span>
            Protected by Dual-Factor Verification &amp; Cryptographic Audit Logs • Office of the University Registrar
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs text-muted-foreground font-medium">
          <span>Privacy Policy</span>
          <span aria-hidden="true">•</span>
          <span>Terms of Service</span>
          <span aria-hidden="true">•</span>
          <span>Registrar Guidelines</span>
        </div>
      </div>
    </footer>
  );
}

export default LoginFooter;
