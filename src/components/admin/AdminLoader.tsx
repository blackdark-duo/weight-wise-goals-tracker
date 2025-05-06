
import React from "react";

const AdminLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff7f50] border-t-transparent"></div>
      <span className="ml-3">Loading...</span>
    </div>
  );
};

export default AdminLoader;
