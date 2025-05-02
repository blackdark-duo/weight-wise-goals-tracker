
import { Link } from "react-router-dom";
import { Session } from "@supabase/supabase-js";

interface NavLogoProps {
  session: Session | null;
}

export const NavLogo = ({ session }: NavLogoProps) => {
  return (
    <Link 
      to={session ? "/dashboard" : "/"} 
      className="flex items-center gap-2 font-bold text-xl md:text-2xl text-[#ff7f50]"
    >
      <img
        src="/lovable-uploads/66bdf397-4a7e-4a9a-a073-26443337d830.png"
        alt="WeightTrack Logo"
        className="h-8 w-8"
      />
      <span className="text-[#ff7f50]">
        WeightTrack
      </span>
    </Link>
  );
};
