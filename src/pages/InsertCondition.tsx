import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CONDITIONS_A, CONDITIONS_B, CONDITIONS_C, CONDITIONS_D,
  CONDITIONS_E, CONDITIONS_F, CONDITIONS_G, CONDITIONS_H,
  CONDITIONS_I, CONDITIONS_L, CONDITIONS_M, CONDITIONS_N,
  CONDITIONS_O, CONDITIONS_P, CONDITIONS_R, CONDITIONS_S,
  CONDITIONS_T, CONDITIONS_U, CONDITIONS_V, CONDITIONS_Z
} from "@/components/conditions";

const InsertCondition = () => {
  const [newCondition, setNewCondition] = useState("");
  const navigate = useNavigate();

  const checkIfConditionExists = (condition: string) => {
    const allConditions = [
      ...CONDITIONS_A, ...CONDITIONS_B, ...CONDITIONS_C, ...CONDITIONS_D,
      ...CONDITIONS_E, ...CONDITIONS_F, ...CONDITIONS_G, ...CONDITIONS_H,
      ...CONDITIONS_I, ...CONDITIONS_L, ...CONDITIONS_M, ...CONDITIONS_N,
      ...CONDITIONS_O, ...CONDITIONS_P, ...CONDITIONS_R, ...CONDITIONS_S,
      ...CONDITIONS_T, ...CONDITIONS_U, ...CONDITIONS_V, ...CONDITIONS_Z
    ];

    return allConditions.some(existingCondition => 
      existingCondition.toLowerCase() === condition.trim().toUpperCase()
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

    // Here we would typically make an API call to save the condition
    toast.success("Patologia inserita con successo");

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