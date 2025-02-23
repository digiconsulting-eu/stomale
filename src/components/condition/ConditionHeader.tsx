
import { Button } from "@/components/ui/button";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { FollowButton } from "./FollowButton";

interface ConditionHeaderProps {
  condition: string;
  conditionId: number;
}

export const ConditionHeader = ({ condition, conditionId }: ConditionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          {capitalizeFirstLetter(condition)}
        </h1>
        <p className="text-gray-600">
          Esperienze e recensioni sulla patologia
        </p>
      </div>
      <FollowButton conditionId={conditionId} />
    </div>
  );
};
