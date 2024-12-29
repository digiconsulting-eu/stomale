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
          className="w-full py-8 text-xl font-bold bg-primary hover:bg-primary-hover text-white shadow-2xl rounded-xl transition-all duration-200 border-2 border-primary-hover"
        >
          Racconta la tua Esperienza con {conditionName}
        </Button>
      </Link>
    </div>
  );
};