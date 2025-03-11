
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { capitalizeFirstLetter } from "@/utils/textUtils";

interface ReviewActionsProps {
  condition: string;
}

export const ReviewActions = ({ condition }: ReviewActionsProps) => {
  const conditionName = capitalizeFirstLetter(condition);
  const formattedCondition = condition.toLowerCase(); // Mantenendo gli spazi originali
  
  return (
    <div className="mb-8">
      {/* Mobile: solo testo */}
      <div className="block md:hidden">
        <Link 
          to={`/nuova-recensione?patologia=${formattedCondition}`}
          className="block text-xl font-semibold text-primary hover:text-primary-hover text-center"
        >
          Racconta la tua Esperienza con {conditionName}
        </Link>
      </div>

      {/* Desktop: pulsante */}
      <div className="hidden md:block">
        <Link to={`/nuova-recensione?patologia=${formattedCondition}`}>
          <Button 
            className="w-full py-8 text-xl font-semibold bg-primary hover:bg-primary-hover text-white shadow-lg rounded-lg transition-all duration-200 border border-primary-hover"
          >
            Racconta la tua Esperienza con {conditionName}
          </Button>
        </Link>
      </div>
    </div>
  );
};
