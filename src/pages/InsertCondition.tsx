import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const InsertCondition = () => {
  const [newCondition, setNewCondition] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCondition.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci il nome della patologia",
        variant: "destructive",
      });
      return;
    }

    // Here we would typically make an API call to save the condition
    // For now, we'll just show a success message
    toast({
      title: "Patologia inserita con successo",
      description: "La patologia è stata aggiunta all'elenco",
    });

    // Create a notification for admin
    const notification = {
      id: Date.now().toString(),
      type: "new_condition",
      title: "Nuova patologia inserita",
      content: `Un utente ha inserito una nuova patologia: ${newCondition.toUpperCase()}`,
      date: new Date().toISOString(),
      read: false,
    };

    // Here we would save the notification to the database
    // For now, we'll just log it
    console.log("New notification:", notification);

    // Reset form and redirect
    setNewCondition("");
    navigate("/cerca-patologia");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Inserisci una nuova patologia</CardTitle>
          <CardDescription>
            Non trovi la patologia che stai cercando? Inseriscila qui e sarà aggiunta all'elenco dopo l'approvazione.
          </CardDescription>
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