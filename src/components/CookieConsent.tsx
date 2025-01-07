import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndConsent = async () => {
      try {
        // Check if user has already accepted cookies
        const hasAccepted = localStorage.getItem("cookiesAccepted");
        if (hasAccepted) {
          setShowConsent(false);
          setIsLoading(false);
          return;
        }

        // Check authentication status
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email) {
          // Check if user is admin
          const { data: adminData } = await supabase
            .from('admin')
            .select('email')
            .eq('email', session.user.email);
          
          const isAdmin = Array.isArray(adminData) && adminData.length > 0;
          
          // Don't show consent if user is admin
          if (isAdmin) {
            setShowConsent(false);
            setIsLoading(false);
            return;
          }
        }

        // Show consent for non-admin users who haven't accepted yet
        setShowConsent(true);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setShowConsent(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndConsent();
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setShowConsent(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookiesRejected", "true");
    setShowConsent(false);
  };

  if (isLoading || !showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
      <div className="container mx-auto">
        <p className="text-sm text-gray-600 mb-4">
          Questo sito utilizza i cookie per migliorare l'esperienza di navigazione. Alcuni cookie sono essenziali per il
          funzionamento del sito, mentre altri ci permettono di raccogliere dati anonimi per analisi e pubblicità
          personalizzata. Per maggiori dettagli, consulta la nostra{" "}
          <Link to="/cookie-policy" className="text-primary hover:underline">
            Cookie Policy
          </Link>
          {" "}e la{" "}
          <Link to="/privacy-policy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleAccept} className="flex-1">
            Accetta tutti i cookie
          </Button>
          <Button variant="outline" onClick={handleReject} className="flex-1">
            Rifiuta tutti i cookie
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/cookie-policy">Impostazioni cookie</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};