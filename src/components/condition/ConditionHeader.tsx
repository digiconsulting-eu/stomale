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
      <h1 className="text-3xl font-bold text-primary">
        {capitalizeFirstLetter(condition)}
      </h1>
      <FollowButton conditionId={conditionId} />
    </div>
  );
};