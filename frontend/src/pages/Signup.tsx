import RegistrationForm from "@/components/auth/RegistrationForm";
import LoginHeader from "@/components/auth/LoginHeader";

function Signup() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <LoginHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <RegistrationForm />
      </main>
    </div>
  );
}

export default Signup;
