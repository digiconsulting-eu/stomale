
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipboardList, Users, Home } from "lucide-react";

export const AdminHeader = () => {
  const location = useLocation();
  const isMainAdmin = location.pathname === '/admin';
  const isReviews = location.pathname.includes('/admin/reviews');
  const isUsers = location.pathname.includes('/admin/users');

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <h1 className="text-2xl md:text-3xl font-bold">Area Amministrazione</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        {!isMainAdmin && (
          <Button asChild variant={isMainAdmin ? "default" : "outline"} className="gap-2">
            <Link to="/admin">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        )}
        <Button 
          asChild 
          variant={isReviews ? "default" : "outline"} 
          className={`gap-2 ${isReviews ? 'bg-[#0EA5E9] hover:bg-[#0284C7]' : ''}`}
        >
          <Link to="/admin/reviews">
            <ClipboardList className="h-4 w-4" />
            Gestione Recensioni
          </Link>
        </Button>
        <Button 
          asChild 
          variant={isUsers ? "default" : "outline"}
          className={`gap-2 ${isUsers ? 'bg-[#0EA5E9] hover:bg-[#0284C7]' : ''}`}
        >
          <Link to="/admin/users">
            <Users className="h-4 w-4" />
            Gestione Utenti
          </Link>
        </Button>
      </div>
    </div>
  );
};
