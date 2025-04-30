
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Glow } from "@/components/ui/glow";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 px-4">
      <div className="relative">
        <Glow variant="both" />
        <div className="relative z-10 text-center max-w-md p-8 rounded-xl border border-gray-100 bg-white/90 backdrop-blur-sm shadow-xl">
          <div className="flex justify-center mb-6">
            <AlertCircle className="h-16 w-16 text-brand-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">Page Not Found</h1>
          <p className="text-lg text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="space-y-4">
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Link to="/">Return to Home</Link>
            </Button>
            <Button variant="outline" asChild className="w-full border-blue-300 hover:bg-blue-50 text-brand-primary">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Path: {location.pathname}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
