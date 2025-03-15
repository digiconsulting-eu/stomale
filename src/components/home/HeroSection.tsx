
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true);
        console.log("Checking auth in HeroSection...");
        
        // Force refresh the session to ensure we have the latest state
        await supabase.auth.refreshSession();
        const { data: { session } } = await supabase.auth.getSession();
        
        const loggedIn = !!session;
        console.log("User logged in status:", loggedIn);
        setIsLoggedIn(loggedIn);
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log("Auth state changed in HeroSection:", event);
      setIsLoggedIn(event === 'SIGNED_IN');
      setIsCheckingAuth(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleNewReview = async (e: React.MouseEvent) => {
    if (isCheckingAuth) {
      // Prevent default action while checking auth
      e.preventDefault();
      return;
    }
    
    // Double-check current authentication state
    const { data: { session } } = await supabase.auth.getSession();
    const currentlyLoggedIn = !!session;
    
    if (!currentlyLoggedIn) {
      e.preventDefault();
      toast.error("Devi effettuare l'accesso per raccontare la tua esperienza", {
        description: "Registrati o accedi per condividere la tua esperienza"
      });
      navigate("/registrati", { state: { returnTo: "/nuova-recensione" } });
      return false;
    }
    
    // Allow the link to work normally if logged in
    return true;
  };
  
  return (
    <>
      {/* Hero Section with gradient */}
      <div className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
        <div className="absolute inset-0 z-0 opacity-10 bg-repeat">
          <div className="absolute w-full h-full bg-[url('/hero-bg-pills.png')] bg-repeat opacity-50"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 animate-fade-in">
              Condividi la tua esperienza
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Aiuta altri pazienti condividendo la tua storia e scopri le esperienze di chi ha vissuto la tua stessa condizione
            </p>
            
            <div className="w-full max-w-xl mx-auto mb-12">
              <SearchBar />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              {isCheckingAuth ? (
                <Button className="w-full sm:w-auto text-base px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Verifica accesso...
                </Button>
              ) : (
                <Link to="/nuova-recensione" onClick={handleNewReview}>
                  <Button className="w-full sm:w-auto text-base px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all">
                    Scrivi una recensione
                  </Button>
                </Link>
              )}
              <Link to="/cerca-patologia">
                <Button variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-2 shadow-md hover:shadow-lg transition-all">
                  Esplora patologie
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave separator */}
      <div className="w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" className="w-full h-20 -mt-1">
          <path 
            fill="#f9fafb" 
            fillOpacity="1" 
            d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </div>
    </>
  );
};
