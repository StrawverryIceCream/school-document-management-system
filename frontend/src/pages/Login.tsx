import LoginForm from "@/components/auth/LoginForm";
import { ModeToggle } from "@/components/ModeToggle";

const Login = () => {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>

      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
