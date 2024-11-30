import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { capitalizeFirstLetter } from "@/utils/textUtils";

interface ConditionOverviewProps {
  condition: string;
  isAdmin: boolean;
}

export const ConditionOverview = ({ condition, isAdmin }: ConditionOverviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  );
  const [editedDescription, setEditedDescription] = useState(description);

  const handleSaveDescription = () => {
    // Here you would typically make an API call to save the description
    setDescription(editedDescription);
    setIsEditing(false);
    toast.success("Descrizione aggiornata con successo");
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold mb-4">
          Cos'è {capitalizeFirstLetter(condition)}?
        </h2>
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
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
        <p className="text-gray-600">{description}</p>
      )}
    </Card>
  );
};