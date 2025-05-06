
import React from "react";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminAuthMessageProps {
  type: "auth" | "access";
}

const AdminAuthMessage: React.FC<AdminAuthMessageProps> = ({ type }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <AlertCircle className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold mb-2">
        {type === "auth" ? "Authentication Required" : "Access Denied"}
      </h1>
      <p className="text-muted-foreground mb-6 text-center">
        {type === "auth" 
          ? "You need to sign in to access this page." 
          : "You do not have permission to access this page."
        }
      </p>
      <button
        onClick={() => navigate(type === "auth" ? "/signin" : "/dashboard")}
        className="bg-[#ff7f50] text-white px-4 py-2 rounded-md hover:bg-[#ff6347]"
      >
        {type === "auth" ? "Sign In" : "Back to Dashboard"}
      </button>
    </div>
  );
};

export default AdminAuthMessage;
