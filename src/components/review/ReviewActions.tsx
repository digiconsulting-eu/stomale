import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { capitalizeFirstLetter } from "@/utils/textUtils";

interface ReviewActionsProps {
  condition: string;
}

export const ReviewActions = ({ condition }: ReviewActionsProps) => {
  const conditionName = capitalizeFirstLetter(condition);
  
  return (
    <div className="mb-8">
      <Link to={`/nuova-recensione?patologia=${condition}`}>
        <Button 
          className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
        >
          Racconta la tua Esperienza con {conditionName}
        </Button>
      </Link>
    </div>
  );
};