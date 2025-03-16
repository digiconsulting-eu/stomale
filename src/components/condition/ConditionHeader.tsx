
import { Button } from "@/components/ui/button";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { FollowButton } from "./FollowButton";

interface ConditionHeaderProps {
  condition: string;
  conditionId: number;
}

export const ConditionHeader = ({ condition, conditionId }: ConditionHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
          {capitalizeFirstLetter(condition)}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Esperienze e recensioni sulla patologia
        </p>
      </div>
      <div className="self-start sm:self-center">
        <FollowButton conditionId={conditionId} />
      </div>
    </div>
  );
};
