
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface CommentDetailsProps {
  username: string;
  content: string;
  createdAt: string;
}

export const CommentDetails = ({ username, content, createdAt }: CommentDetailsProps) => {
  const formattedDate = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: it })
    : "";

  return (
    <div className="flex flex-col">
      <div className="font-medium break-words max-w-[70%]">{username}</div>
      <div className="mt-1 text-sm text-muted-foreground">{content}</div>
      <div className="mt-1 text-xs text-gray-500">{formattedDate}</div>
    </div>
  );
};
