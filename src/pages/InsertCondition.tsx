import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const InsertCondition = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const [newCondition, setNewCondition] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(
    "Non trovi la patologia che stai cercando? Inseriscila qui e sarà aggiunta all'elenco dopo l'approvazione."
  );
  const [editedDescription, setEditedDescription] = useState(description);

  const checkIfConditionExists = (condition: string) => {
    const pendingConditions = JSON.parse(localStorage.getItem('pendingConditions') || '[]');
    return pendingConditions.some((existingCondition: string) => 
      existingCondition.toLowerCase() === condition.trim().toLowerCase()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCondition.trim()) {
      toast.error("Inserisci il nome della patologia");
      return;
    }

    if (checkIfConditionExists(newCondition)) {
      toast.error("Questa patologia è già presente nell'elenco");
      return;
    }

    // Save the new condition to pendingConditions in localStorage
    const pendingConditions = JSON.parse(localStorage.getItem('pendingConditions') || '[]');
    pendingConditions.push(newCondition.trim().toUpperCase());
    localStorage.setItem('pendingConditions', JSON.stringify(pendingConditions));

    // Create a notification for admin
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notification = {
      id: Date.now().toString(),
      type: "new_condition",
      title: "Nuova patologia inserita",
      content: `Un utente ha inserito una nuova patologia: ${newCondition.toUpperCase()}`,
      date: new Date().toISOString(),
      read: false,
    };
    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Reset form and redirect
    setNewCondition("");
    toast.success("Patologia inserita con successo! Sarà visibile dopo l'approvazione dell'amministratore.");
    navigate("/cerca-patologia");
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
              />
            </div>
            <Button type="submit" className="w-full">
              Inserisci Patologia
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsertCondition;