import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const CommentSection = () => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState("");

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Il commento non può essere vuoto");
      return;
    }
    // Here you would typically send the comment to your backend
    toast.success("Commento inviato con successo!");
    setComment("");
    setShowCommentForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          className="flex items-center gap-2 bg-blue-50 text-primary hover:bg-blue-100"
          onClick={() => setShowCommentForm(!showCommentForm)}
        >
          <MessageCircle size={18} />
          Commenta
        </Button>
      </div>

      {showCommentForm && (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            placeholder="Scrivi il tuo commento..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px]"
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowCommentForm(false)}
            >
              Annulla
            </Button>
            <Button type="submit">
              Invia Commento
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};