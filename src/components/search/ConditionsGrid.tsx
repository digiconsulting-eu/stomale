
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
    console.log('ConditionsGrid rendering for Safari compatibility with conditions:', conditions);
    
    // Extra validation for Safari
    if (conditions && Array.isArray(conditions)) {
      if (conditions.length === 0) {
        console.log('Conditions array is empty');
      } else {
        console.log('First condition sample:', conditions[0]);
      }
    } else {
      console.error('Conditions is not an array:', conditions);
    }
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

  // Extra safety check for Safari
  if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-gray-500">Nessuna patologia trovata.</p>
      </div>
    );
  }

  // Helper function to properly encode the pathname for URL
  const formatPathName = (name: string) => {
    if (!name || typeof name !== 'string') return "";
    return name.toLowerCase().trim();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {conditions.map((condition, index) => {
        // Skip undefined or empty conditions
        if (!condition || !condition.Patologia) {
          console.log('Skipping invalid condition at index:', index, condition);
          return null;
        }
        
        // Ensure properties are valid for Safari
        const safeId = typeof condition.id === 'number' ? condition.id : index;
        const safePatologia = typeof condition.Patologia === 'string' ? condition.Patologia : 'Patologia non specificata';
        
        console.log('Rendering condition for Safari:', safeId, safePatologia);
        
        return (
          <Link 
            key={safeId}
            to={`/patologia/${formatPathName(safePatologia)}`}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white group"
          >
            <h2 className="text-xl font-semibold text-[#0EA5E9] group-hover:text-[#0EA5E9]/80 transition-colors">
              {safePatologia}
            </h2>
          </Link>
        );
      })}
    </div>
  );
};
