
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    displayName: ""
  });
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

  const validateForm = () => {
    let isValid = true;
    const errors = {
      email: "",
      password: "",
      displayName: ""
    };

    // Validate display name
    if (!displayName.trim()) {
      errors.displayName = "Display name is required";
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate password
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
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
          },
          emailRedirectTo: window.location.origin + "/dashboard"
        }
      });

      if (error) {
        if (error.message.includes('already')) {
          // User may already exist but not confirmed
          // Try to sign them in directly
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) {
            throw signInError;
          } else {
            toast.success("Signed in to existing account!");
            navigate("/dashboard");
            return;
          }
        }
        throw error;
      }

      if (data.user) {
        // Automatically sign in after registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) throw signInError;
        
        toast.success("Account created successfully! Welcome to Weight Wise.");
        navigate("/dashboard");
      }
    } catch (err: any) {
      let errorMessage = err.message || "Failed to sign up. Please try again.";
      
      // Improve error messages
      if (errorMessage.includes("already registered")) {
        errorMessage = "This email is already registered. Try signing in instead.";
      } else if (errorMessage.includes("password")) {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (errorMessage.includes("email")) {
        errorMessage = "Please provide a valid email address.";
      }
      
      setError(errorMessage);
      console.error("Sign up error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 p-4">
      <Card className="mx-auto max-w-md w-full border-brand-primary/10 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img
              src="/lovable-uploads/6b04f662-fb0c-44df-9e2d-b98a7410f381.png"
              alt="Weight Wise Logo"
              className="h-12 w-12"
            />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#ff7f50] to-[#ff6347] bg-clip-text text-transparent">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your details to get started with Weight Wise
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
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
                className={formErrors.displayName ? "border-destructive" : ""}
              />
              {formErrors.displayName && (
                <p className="text-xs text-destructive mt-1">{formErrors.displayName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={formErrors.email ? "border-destructive" : ""}
              />
              {formErrors.email && (
                <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={formErrors.password ? "border-destructive" : ""}
              />
              {formErrors.password ? (
                <p className="text-xs text-destructive mt-1">{formErrors.password}</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Password must be at least 6 characters long
                </p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#ff7f50] to-[#ff6347] hover:from-[#ff6347] hover:to-[#ff5733]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/signin" className="text-[#ff7f50] hover:underline font-medium">
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
