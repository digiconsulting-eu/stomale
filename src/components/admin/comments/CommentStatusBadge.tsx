
import { Badge } from "@/components/ui/badge";

interface CommentStatusBadgeProps {
  status: string;
}

export const CommentStatusBadge = ({ status }: CommentStatusBadgeProps) => {
  let variant: "default" | "outline" | "secondary" | "destructive" = "default";
  let label = status;

  switch (status) {
    case "approved":
      variant = "default";
      label = "Approvato";
      break;
    case "rejected":
      variant = "destructive";
      label = "Rifiutato";
      break;
    case "pending":
      variant = "secondary";
      label = "In attesa";
      break;
    default:
      variant = "outline";
  }

  return (
    <Badge variant={variant} className="text-xs">
      {label}
    </Badge>
  );
};
