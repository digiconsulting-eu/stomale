import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Review Management Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Gestione Recensioni</h2>
          <p className="text-gray-600 mb-6">
            Gestisci le recensioni degli utenti, approva o rimuovi contenuti.
          </p>
          <Button 
            onClick={() => navigate('/admin/reviews')}
            className="w-full"
          >
            Vai a Gestione Recensioni
          </Button>
        </div>

        {/* User Management Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Gestione Utenti</h2>
          <p className="text-gray-600 mb-6">
            Visualizza e gestisci gli utenti registrati sulla piattaforma.
          </p>
          <Button 
            onClick={() => navigate('/admin/users')}
            className="w-full"
          >
            Vai a Gestione Utenti
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Admin;