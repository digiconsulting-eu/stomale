import { Button } from "@/components/ui/button";

interface ReviewActionsProps {
  condition: string;
}

export const ReviewActions = ({ condition }: ReviewActionsProps) => {
  return (
    <div className="mb-8">
      <Button 
        className="w-full py-6 text-lg font-medium bg-primary hover:bg-primary-hover text-white shadow-lg"
      >
        Racconta la tua Esperienza con {condition}
      </Button>
    </div>
  );
};