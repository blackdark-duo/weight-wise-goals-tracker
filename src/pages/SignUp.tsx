
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Info } from "lucide-react";
import SupabaseNote from "@/components/SupabaseNote";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"register" | "verify">("register");
  const [message, setMessage] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // This will be implemented with Supabase later
      console.log("Sign up with:", email, password);
      
      // Simulate sending verification code
      setTimeout(() => {
        setMessage("Verification code has been sent to your email. Please check and enter the code below.");
        setStep("verify");
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      setError("Failed to sign up. Please try again.");
      console.error("Sign up error:", err);
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // This will be implemented with Supabase later
      console.log("Verifying with code:", verificationCode);
      
      // Simulate verification
      setTimeout(() => {
        // Will redirect to dashboard after verification in the real implementation
        // navigate("/dashboard");
        setMessage("Verification successful! Redirecting to dashboard...");
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      setError("Invalid verification code. Please try again.");
      console.error("Verification error:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-ui-background p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {step === "register" ? "Create an account" : "Verify your email"}
          </CardTitle>
          <CardDescription>
            {step === "register" 
              ? "Enter your email and create a password to get started" 
              : "Enter the verification code sent to your email"}
          </CardDescription>
        </CardHeader>
        
        {step === "register" ? (
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              <SupabaseNote />
              
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>
              
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-600 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5" />
                <p>
                  We'll send a verification code to your email to ensure you're a real person. 
                  This helps us prevent fake accounts.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/signin" className="text-brand-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerification}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              
              {message && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
                  {message}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
              
              <div className="text-sm">
                Didn't receive a code?{" "}
                <button
                  type="button"
                  className="text-brand-primary hover:underline"
                  onClick={() => {
                    setMessage("Sending a new verification code...");
                    // Implement resend logic with Supabase later
                    setTimeout(() => {
                      setMessage("A new verification code has been sent to your email.");
                    }, 1000);
                  }}
                >
                  Resend
                </button>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep("register")}
              >
                Back to Sign Up
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

export default SignUp;
