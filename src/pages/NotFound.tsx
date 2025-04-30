
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50 to-blue-50">
      <div className="text-center max-w-md p-8 rounded-xl shadow-sm border border-purple-100 bg-white">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-24 w-24 text-purple-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
            <Link to="/">Return Home</Link>
          </Button>
          <Button variant="outline" asChild className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Path: {location.pathname}
        </p>
      </div>
    </div>
  );
};

export default NotFound;
