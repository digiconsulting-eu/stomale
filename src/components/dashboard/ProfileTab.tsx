import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GenderSelect } from "@/components/registration/GenderSelect";
import { BirthYearSelect } from "@/components/registration/BirthYearSelect";

export const ProfileTab = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");

  // Fetch user profile data
  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profile, error } = await supabase
        .from('users')
        .select('username, birth_year, gender')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setUsername(profile.username);
        setBirthYear(profile.birth_year || "");
        setGender(profile.gender || "");
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error("Errore nel caricamento del profilo");
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Update profile
  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('users')
        .update({
          username,
          birth_year: birthYear,
          gender,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast.success("Profilo aggiornato con successo");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Errore nell'aggiornamento del profilo");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Delete the user's data from the public.users table
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', session.user.id);

      if (deleteError) throw deleteError;

      // Sign out the user
      await supabase.auth.signOut();
      navigate('/', { replace: true });
      toast.success("Account eliminato con successo");
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("Errore nell'eliminazione dell'account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Il Tuo Profilo</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <BirthYearSelect
          value={birthYear}
          onChange={setBirthYear}
          disabled={isLoading}
        />

        <GenderSelect
          value={gender}
          onChange={setGender}
          disabled={isLoading}
        />

        <Button
          onClick={handleUpdateProfile}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Aggiornamento..." : "Aggiorna Profilo"}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              Elimina Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
              <AlertDialogDescription>
                Questa azione non può essere annullata. Eliminerà permanentemente il tuo account
                e tutti i dati associati.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-destructive text-destructive-foreground"
              >
                Elimina Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};