
import { ConditionOverview } from "@/components/condition/ConditionOverview";
import { ConditionReviews } from "@/components/condition/ConditionReviews";

interface ConditionContentProps {
  condition: string;
  isAdmin: boolean;
  reviewsCount: number;
  reviews: any[];
  isLoading: boolean;
  onRetry?: () => void;
}

export const ConditionContent = ({ 
  condition, 
  isAdmin, 
  reviewsCount, 
  reviews, 
  isLoading,
  onRetry 
}: ConditionContentProps) => {
  return (
    <div className="md:col-span-8">
      <div id="overview" className="mt-8">
        <ConditionOverview 
          condition={condition} 
          isAdmin={isAdmin}
        />
      </div>

      <div id="experiences" className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          Esperienze ({reviewsCount})
        </h2>
        <ConditionReviews
          reviews={reviews}
          isLoading={isLoading}
          condition={condition}
          onRetry={onRetry}
        />
      </div>
    </div>
  );
};
