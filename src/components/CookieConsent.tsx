import { useState } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Link } from "react-router-dom";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(() => {
    const consent = localStorage.getItem("cookieConsent");
    return !consent;
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [cookieSettings, setCookieSettings] = useState({
    necessary: true, // Always true and can't be changed
    experience: false,
    measurement: false,
    marketing: false,
  });

  const handleAcceptAll = () => {
    const settings = {
      necessary: true,
      experience: true,
      measurement: true,
      marketing: true,
    };
    localStorage.setItem("cookieConsent", JSON.stringify(settings));
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const settings = {
      necessary: true,
      experience: false,
      measurement: false,
      marketing: false,
    };
    localStorage.setItem("cookieConsent", JSON.stringify(settings));
    setShowBanner(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem("cookieConsent", JSON.stringify(cookieSettings));
    setShowSettings(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
        <div className="container mx-auto max-w-6xl">
          <p className="text-sm text-text mb-4">
            Questo sito utilizza i cookie per migliorare l'esperienza di navigazione. 
            Alcuni cookie sono essenziali per il funzionamento del sito, mentre altri 
            ci permettono di raccogliere dati anonimi per analisi e pubblicità personalizzata. 
            Per maggiori dettagli, consulta la nostra{" "}
            <Link to="/cookie-policy" className="text-primary hover:underline">
              Cookie Policy
            </Link>{" "}
            e la{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAcceptAll} variant="default">
              Accetta tutti i cookie
            </Button>
            <Button onClick={handleRejectAll} variant="outline">
              Rifiuta tutti i cookie
            </Button>
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
            >
              Impostazioni cookie
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px] bg-white"> {/* Added explicit white background */}
          <DialogHeader>
            <DialogTitle>Impostazioni Cookie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 bg-white"> {/* Added explicit white background */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="necessary"
                checked={cookieSettings.necessary}
                disabled
              />
              <Label htmlFor="necessary" className="text-sm font-medium">
                Necessari
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="experience"
                checked={cookieSettings.experience}
                onCheckedChange={(checked) =>
                  setCookieSettings({ ...cookieSettings, experience: !!checked })
                }
              />
              <Label htmlFor="experience" className="text-sm font-medium">
                Esperienza
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="measurement"
                checked={cookieSettings.measurement}
                onCheckedChange={(checked) =>
                  setCookieSettings({ ...cookieSettings, measurement: !!checked })
                }
              />
              <Label htmlFor="measurement" className="text-sm font-medium">
                Misurazione
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="marketing"
                checked={cookieSettings.marketing}
                onCheckedChange={(checked) =>
                  setCookieSettings({ ...cookieSettings, marketing: !!checked })
                }
              />
              <Label htmlFor="marketing" className="text-sm font-medium">
                Marketing (TCF IAB)
              </Label>
            </div>
          </div>
          <div className="flex justify-end bg-white"> {/* Added explicit white background */}
            <Button onClick={handleSaveSettings}>Salva preferenze</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};