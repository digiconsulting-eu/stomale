import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const InsertCondition = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const [newCondition, setNewCondition] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(
    "Non trovi la patologia che stai cercando? Inseriscila qui e sarà aggiunta all'elenco dopo l'approvazione."
  );
  const [editedDescription, setEditedDescription] = useState(description);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkIfConditionExists = async (condition: string) => {
    try {
      const { data, error } = await supabase
        .from('PATOLOGIE')
        .select('Patologia')
        .ilike('Patologia', condition.trim());

      if (error) {
        console.error('Error checking condition:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error in checkIfConditionExists:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCondition.trim()) {
      toast.error("Inserisci il nome della patologia");
      return;
    }

    setIsSubmitting(true);

    try {
      const exists = await checkIfConditionExists(newCondition);
      
      if (exists) {
        toast.error("Questa patologia è già presente nell'elenco");
        setIsSubmitting(false);
        return;
      }

      const normalizedCondition = newCondition.trim().toUpperCase();

      const { error } = await supabase
        .from('PATOLOGIE')
        .insert([
          { 
            Patologia: normalizedCondition,
            Descrizione: '' 
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          toast.error("Questa patologia è già presente nell'elenco");
        } else {
          console.error('Error inserting condition:', error);
          toast.error("Si è verificato un errore durante l'inserimento della patologia");
        }
        return;
      }

      // Reset form and show success message
      setNewCondition("");
      toast.success("Patologia inserita con successo!");
      navigate("/cerca-patologia");
    } catch (error) {
      console.error('Error inserting condition:', error);
      toast.error("Si è verificato un errore durante l'inserimento della patologia");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDescription = () => {
    setDescription(editedDescription);
    setIsEditingDescription(false);
    toast.success("Descrizione aggiornata con successo");
  };

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Devi effettuare l'accesso per inserire una nuova patologia");
      navigate("/registrati");
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Inserisci una nuova patologia</CardTitle>
              <CardDescription>
                {isEditingDescription ? (
                  <div className="space-y-4 mt-4">
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingDescription(false);
                          setEditedDescription(description);
                        }}
                      >
                        Annulla
                      </Button>
                      <Button onClick={handleSaveDescription}>
                        Salva
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <span>{description}</span>
                    {isLoggedIn && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditingDescription(true)}
                        className="flex-shrink-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Nome della patologia"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                className="w-full"
                disabled={isSubmitting}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Inserimento in corso..." : "Inserisci Patologia"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsertCondition;