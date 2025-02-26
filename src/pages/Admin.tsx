
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileUp } from "lucide-react";
import { regenerateSitemaps } from "@/utils/sitemapUtils";

const Admin = () => {
  const navigate = useNavigate();

  const handleRegenerateSitemaps = async () => {
    await regenerateSitemaps();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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

        {/* Import Management Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Importazione Dati</h2>
          <p className="text-gray-600 mb-6">
            Importa recensioni e descrizioni delle patologie da file Excel.
          </p>
          <Button 
            onClick={() => navigate('/admin/import')}
            className="w-full flex items-center justify-center gap-2"
          >
            <FileUp className="h-4 w-4" />
            Vai a Importazione
          </Button>
        </div>

        {/* Sitemap Management Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Gestione Sitemap</h2>
          <p className="text-gray-600 mb-6">
            Rigenera i sitemap XML per l'indicizzazione delle recensioni.
          </p>
          <Button 
            onClick={handleRegenerateSitemaps}
            className="w-full"
          >
            Rigenera Sitemap
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
