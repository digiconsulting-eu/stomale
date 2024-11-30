import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

const Footer = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    line1: "StoMale.info",
    line2: "Via Example 123, 12345 City",
    line3: "P.IVA 12345678901",
  });

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    const savedInfo = localStorage.getItem("companyInfo");
    if (savedInfo) {
      setCompanyInfo(JSON.parse(savedInfo));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("companyInfo", JSON.stringify(companyInfo));
    setIsEditing(false);
    toast.success("Informazioni aziendali aggiornate");
  };

  return (
    <footer className="mt-auto bg-white border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-6 md:mb-0">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={companyInfo.line1}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, line1: e.target.value })
                  }
                  placeholder="Riga 1"
                  className="max-w-xs"
                />
                <Input
                  value={companyInfo.line2}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, line2: e.target.value })
                  }
                  placeholder="Riga 2"
                  className="max-w-xs"
                />
                <Input
                  value={companyInfo.line3}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, line3: e.target.value })
                  }
                  placeholder="Riga 3"
                  className="max-w-xs"
                />
                <div className="space-x-2">
                  <Button onClick={handleSave}>Salva</Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="space-y-1 text-text-light">
                  <p>{companyInfo.line1}</p>
                  <p>{companyInfo.line2}</p>
                  <p>{companyInfo.line3}</p>
                </div>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-8 top-0"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Link to="/cookie-policy" className="text-text-light hover:text-primary">
              Cookie Policy
            </Link>
            <Link to="/privacy-policy" className="text-text-light hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-text-light hover:text-primary">
              Termini e Condizioni
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;