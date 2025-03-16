
import { Button } from "@/components/ui/button";

interface ConditionActionsProps {
  condition: string;
  onNavigate: (sectionId: string) => void;
  onNewReview: () => void;
}

export const ConditionActions = ({ condition, onNavigate, onNewReview }: ConditionActionsProps) => {
  return (
    <div className="grid gap-4">
      <Button 
        className="w-full text-lg py-6 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
        onClick={() => onNavigate('overview')}
      >
        Panoramica
      </Button>
      
      <Button 
        className="w-full text-lg py-6 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
        onClick={() => onNavigate('experiences')}
      >
        Leggi Esperienze
      </Button>
      
      <Button 
        className="w-full text-lg py-6 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
        onClick={onNewReview}
      >
        Racconta la tua Esperienza
      </Button>
    </div>
  );
};
