
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          return;
        }
        
        if (data.session) {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Server-side validation
    if (!email || !email.trim()) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError("Password is required");
      setIsLoading(false);
      return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      // Sign in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create a demo session for testing
        localStorage.setItem("demo-auth-session", "true");
        toast.success("Successfully signed in!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      let errorMessage = "Failed to sign in. Please check your credentials.";
      
      // Enhance error messages based on error types
      if (err.message.includes("Invalid login")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (err.message.includes("Email not confirmed")) {
        errorMessage = "Please confirm your email before signing in.";
      } else if (err.message.includes("rate limit")) {
        errorMessage = "Too many login attempts. Please try again later.";
      }
      
      setError(errorMessage);
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-white via-[#ff7f50]/5 to-[#ff6347]/5 p-4">
      <Card className="mx-auto max-w-md w-full shadow-lg border border-[#ff7f50]/20">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img
              src="/lovable-uploads/6b04f662-fb0c-44df-9e2d-b98a7410f381.png"
              alt="Weight Wise Wise Logo"
              className="h-12 w-12"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-[#ff7f50]">Welcome to Weight Wise Wise</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignIn}>
          <CardContent className="space-y-4">
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
                placeholder="john.doe@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[#ff7f50]/20 focus:border-[#ff7f50]/40"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-[#ff7f50] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-[#ff7f50]/20 focus:border-[#ff7f50]/40"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#ff7f50] to-[#ff6347] hover:from-[#ff6347] hover:to-[#ff5733]" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-[#ff7f50] hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignIn;
