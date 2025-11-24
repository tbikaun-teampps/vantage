// components/login-form.tsx
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconAlertCircle, IconLoader } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if form is valid (both email and password have values)
  const isFormValid = email.trim() !== "" && password.trim() !== "";
  const isLoginDisabled = loading || !isFormValid;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't proceed if form is invalid or already loading
    if (isLoginDisabled) return;

    setLoading(true);
    setError("");

    const { error, redirectPath } = await signIn(email, password);

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      // Redirect to intended location or use auth store's redirect path
      const from =
        (location.state as any)?.from || redirectPath || "/select-company";
      navigate(from);
      // Don't set loading to false - let the page transition handle it
    }
  };

  // const handleResetPassword = () => {
  //   navigate("/forgot-password");
  // };

  return (
    <Card className={cn("w-full backdrop-blur-sm", className)} {...props}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-2 font-medium">
              <img
                src="/assets/logos/vantage-logo-white.png"
                alt="Vantage Logo"
                className="hidden dark:block"
                width={96}
                height={96}
              />
              <img
                src="/assets/logos/vantage-logo.svg"
                alt="Vantage Logo"
                className="block dark:hidden"
                width={96}
                height={96}
              />
              <span className="sr-only">Vantage</span>
            </div>
            <h1 className="text-xl font-bold">Welcome to Vantage</h1>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3">
              {/* <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-muted-foreground hover:text-primary p-0 h-auto"
                  onClick={handleResetPassword}
                >
                  Forgot your password?
                </Button>
              </div> */}
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className={`w-full transition-all duration-300 ${
                loading
                  ? "bg-gradient-to-r from-[#eb59ff] to-[#032a83] border-0 text-white animate-brand-wave"
                  : ""
              }`}
              disabled={isLoginDisabled}
            >
              <span className="relative z-20 flex items-center justify-center">
                {loading && (
                  <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                )}
                {loading ? "Signing in..." : "Login"}
              </span>
            </Button>

            {/* Reset Password Section */}
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
