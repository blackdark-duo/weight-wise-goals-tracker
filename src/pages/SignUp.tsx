
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

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
  const [step, setStep] = useState(1); // Step 1: Initial sign up, Step 2: OTP verification
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
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

  // Generate a random 6-digit OTP
  const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", otp); // For testing purposes
    return otp;
  };

  const handleInitialSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      // Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();
      
      if (existingUser) {
        setError("This email is already registered. Try signing in instead.");
        setIsLoading(false);
        return;
      }
      
      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is expected if the user doesn't exist
        console.error("Error checking existing user:", checkError);
      }
      
      // Generate OTP
      const newOtp = generateOTP();
      setGeneratedOtp(newOtp);
      
      // In a real app, you would send this OTP via email using Supabase Edge Functions
      // For now, we'll just store it and move to the verification step
      
      toast.success("OTP sent to your email. Please check your inbox.");
      setStep(2);
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Verify OTP
      if (otp !== generatedOtp) {
        setError("Invalid OTP. Please check and try again.");
        setIsLoading(false);
        return;
      }

      // Sign up with Supabase auth after OTP verification
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
        throw error;
      }

      if (data.user) {
        // Create a demo session for testing
        localStorage.setItem("demo-auth-session", "true");
        
        // Automatically sign in the user after registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          throw signInError;
        }
        
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
            {step === 1 ? "Create an account" : "Verify your email"}
          </CardTitle>
          <CardDescription>
            {step === 1 
              ? "Enter your details to get started with Weight Wise"
              : "Enter the OTP sent to your email"
            }
          </CardDescription>
        </CardHeader>
        
        {step === 1 ? (
          <form onSubmit={handleInitialSignUp}>
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
                  placeholder="m@example.com"
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
                    Continue
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
        ) : (
          <div>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-center block">Enter verification code</Label>
                <div className="flex justify-center py-4">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  We've sent a verification code to {email}
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                onClick={handleOtpVerification}
                className="w-full bg-gradient-to-r from-[#ff7f50] to-[#ff6347] hover:from-[#ff6347] hover:to-[#ff5733]"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Create Account"
                )}
              </Button>
              
              <div className="text-center text-sm">
                <Button 
                  variant="link" 
                  className="text-[#ff7f50] p-0 h-auto" 
                  onClick={() => setStep(1)}
                >
                  Back to sign up
                </Button>
              </div>
            </CardFooter>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SignUp;
