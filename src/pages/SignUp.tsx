
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Info } from "lucide-react";
import SupabaseNote from "@/components/SupabaseNote";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Sign up with Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: displayName
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create a demo session for testing
        localStorage.setItem("demo-auth-session", "true");
        toast.success("Account created successfully! Welcome to WeightWise.");
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign up. Please try again.");
      console.error("Sign up error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to create the admin account
  const createAdminAccount = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Try to create the admin account
      const { data, error } = await supabase.auth.signUp({
        email: "admin@admin.com",
        password: "admin",
        options: {
          data: {
            name: "Admin"
          }
        }
      });

      if (error) {
        throw error;
      }

      toast.success("Admin account created! You can now sign in with admin@admin.com");
    } catch (err: any) {
      setError(err.message || "Failed to create admin account.");
      console.error("Admin account creation error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-ui-background p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your details to get started with WeightWise
          </CardDescription>
        </CardHeader>
        
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
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="John Doe"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            
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
                Password must be at least 6 characters long
              </p>
            </div>
            
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-600 flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5" />
              <p>
                No email verification is required. You'll be automatically logged in after signing up.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            
            <Button type="button" variant="outline" className="w-full" onClick={createAdminAccount}>
              Create Admin Account
            </Button>
            
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/signin" className="text-brand-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignUp;
