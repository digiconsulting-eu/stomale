import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { setPageTitle } from "@/utils/pageTitle";

export default function InsertCondition() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Inserisci Patologia"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if condition already exists
      const { data: existingCondition } = await supabase
        .from('PATOLOGIE')
        .select('Patologia')
        .ilike('Patologia', name)
        .single();

      if (existingCondition) {
        toast.error("Questa patologia esiste già");
        return;
      }

      // Insert new condition
      const { error } = await supabase
        .from('PATOLOGIE')
        .insert([
          {
            Patologia: name.toUpperCase(),
            Descrizione: description,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast.success("Patologia inserita con successo");
      navigate(`/cerca-patologia`);
    } catch (error: any) {
      console.error('Error inserting condition:', error);
      toast.error("Errore durante l'inserimento della patologia", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-6">
          Inserisci una Nuova Patologia
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome Patologia
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Inserisci il nome della patologia"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descrizione
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Inserisci una breve descrizione della patologia"
              disabled={isLoading}
              rows={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Inserimento..." : "Inserisci Patologia"}
          </Button>
        </form>

        <div className="mt-6 text-sm text-text-light">
          <p>
            La patologia verrà revisionata dal nostro team prima di essere pubblicata.
            Riceverai una notifica quando sarà approvata.
          </p>
        </div>
      </div>
    </div>
  );
}