
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface Condition {
  id: number;
  Patologia: string;
}

interface ConditionsGridProps {
  conditions: Condition[];
  isLoading: boolean;
}

export const ConditionsGrid = ({ conditions, isLoading }: ConditionsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[100px]" />
        ))}
      </div>
    );
  }

  if (!conditions || conditions.length === 0) {
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-gray-500">Nessuna patologia trovata. Prova a cambiare i criteri di ricerca.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 text-blue-500 underline"
        >
          Ricarica la pagina
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {conditions.map(condition => (
        <Link 
          key={condition.id}
          to={`/patologia/${encodeURIComponent(condition.Patologia.toLowerCase().replace(/\s+/g, '-'))}`}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white group"
        >
          <h2 className="text-xl font-semibold text-[#0EA5E9] group-hover:text-[#0EA5E9]/80 transition-colors">
            {condition.Patologia}
          </h2>
        </Link>
      ))}
    </div>
  );
};
