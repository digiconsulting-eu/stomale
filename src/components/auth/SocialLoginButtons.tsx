
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export const SocialLoginButtons = ({ isLoading: parentIsLoading }: { isLoading: boolean }) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      console.log("Initiating Google login...");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            prompt: 'consent',
            access_type: 'offline',
          },
          redirectTo: window.location.origin + '/auth/callback',
        }
      });
      
      if (error) {
        console.error("Google login error:", error);
        toast.error("Errore durante il login con Google", {
          description: `${error.message} (Codice: ${error.code || 'N/A'})`
        });
      } else {
        console.log("Google login initiated successfully:", data);
      }
    } catch (error: any) {
      console.error("Unexpected error during Google login:", error);
      toast.error("Errore durante il login con Google", {
        description: error?.message || "Si è verificato un errore imprevisto"
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Button
        variant="outline"
        className="w-full max-w-[200px]"
        onClick={handleGoogleLogin}
        disabled={parentIsLoading || isGoogleLoading}
      >
        {isGoogleLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
        ) : (
          <FcGoogle className="h-5 w-5 mr-2" />
        )}
        <span>Google</span>
      </Button>
    </div>
  );
};
