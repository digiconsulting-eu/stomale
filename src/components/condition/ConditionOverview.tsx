import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ConditionOverviewProps {
  condition: string;
  isAdmin: boolean;
}

export const ConditionOverview = ({ condition, isAdmin }: ConditionOverviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");

  const { data: descriptionData, refetch } = useQuery({
    queryKey: ['condition-description', condition],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('PATOLOGIE')
        .select('Descrizione')
        .eq('Patologia', condition.replace(/-/g, ' ').toUpperCase())
        .single();
      
      if (error) throw error;
      return data?.Descrizione || "";
    }
  });

  const handleSaveDescription = async () => {
    try {
      const { error } = await supabase
        .from('PATOLOGIE')
        .upsert({
          Patologia: condition.replace(/-/g, ' ').toUpperCase(),
          Descrizione: editedDescription
        }, {
          onConflict: 'Patologia'
        });

      if (error) throw error;

      await refetch();
      setIsEditing(false);
      toast.success("Descrizione aggiornata con successo");
    } catch (error) {
      console.error('Error saving description:', error);
      toast.error("Errore durante il salvataggio della descrizione");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold mb-4">
          Cos'è {capitalizeFirstLetter(condition.replace(/-/g, ' '))}?
        </h2>
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsEditing(!isEditing);
              setEditedDescription(descriptionData || "");
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="min-h-[150px]"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setEditedDescription(descriptionData || "");
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
        <p className="text-gray-600">
          {descriptionData || "Nessuna descrizione disponibile per questa patologia."}
        </p>
      )}
    </Card>
  );
};