
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

interface Condition {
  id: number;
  Patologia: string;
}

interface ConditionsGridProps {
  conditions: Condition[];
  isLoading: boolean;
}

export const ConditionsGrid = ({ conditions, isLoading }: ConditionsGridProps) => {
  // Log conditions on mount and when they change
  useEffect(() => {
    console.log('ConditionsGrid rendering with conditions:', conditions);
  }, [conditions]);

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
        <p className="text-gray-500">Nessuna patologia trovata.</p>
      </div>
    );
  }

  // Helper function to properly encode the pathname for URL
  const formatPathName = (name: string) => {
    if (!name) return "";
    return name.toLowerCase();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {conditions.map(condition => {
        // Skip undefined or empty conditions
        if (!condition || !condition.Patologia) {
          console.log('Skipping invalid condition:', condition);
          return null;
        }
        
        console.log('Rendering condition:', condition.id, condition.Patologia);
        
        return (
          <Link 
            key={condition.id}
            to={`/patologia/${formatPathName(condition.Patologia)}`}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white group"
          >
            <h2 className="text-xl font-semibold text-[#0EA5E9] group-hover:text-[#0EA5E9]/80 transition-colors">
              {condition.Patologia}
            </h2>
          </Link>
        );
      })}
    </div>
  );
};
