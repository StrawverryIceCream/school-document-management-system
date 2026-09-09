import { SignupForm } from "@/components/auth/SignupForm";
import { ModeToggle } from "@/components/ModeToggle";

const Signup = () => {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>

      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
};

export default Signup;
