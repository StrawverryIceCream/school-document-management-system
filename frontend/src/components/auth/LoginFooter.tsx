function LoginFooter() {
  return (
    <footer
      className="w-full border-t border-surface-border/70 py-4 bg-surface/80"
      data-purpose="security-footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center space-x-2 text-[11px] text-gray-500 font-medium">
          <svg
            className="w-4 h-4 text-emerald-600 shrink-0"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            ></path>
          </svg>
          <span>
            Protected by SIS Dual-Factor Verification &amp; End-to-End
            Encryption • Office of the University Registrar
          </span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] text-gray-500 font-medium">
          <a className="hover:text-crimson-700 transition" href="#">
            Privacy Policy
          </a>
          <span>•</span>
          <a className="hover:text-crimson-700 transition" href="#">
            Terms of Service
          </a>
          <span>•</span>
          <a className="hover:text-crimson-700 transition" href="#">
            Registrar Guidelines
          </a>
        </div>
      </div>
    </footer>
  );
}

export default LoginFooter;
