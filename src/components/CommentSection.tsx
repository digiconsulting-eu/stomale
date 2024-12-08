import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CommentSectionProps {
  reviewId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ reviewId }) => {
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleOpenCommentBox = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Devi effettuare l'accesso per commentare");
      navigate('/login');
      return;
    }
    
    setIsCommentBoxOpen(true);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error('Il commento non può essere vuoto');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          review_id: reviewId,
          content: comment,
        });

      if (error) throw error;

      toast.success('Commento inviato con successo');
      setComment('');
      setIsCommentBoxOpen(false);
    } catch (error) {
      console.error('Errore durante l\'invio del commento:', error);
      toast.error('Impossibile inviare il commento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isCommentBoxOpen ? (
        <div className="flex justify-end">
          <Button 
            onClick={handleOpenCommentBox}
            className="bg-primary/10 hover:bg-primary/20 text-primary"
          >
            Commenta
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            placeholder="Scrivi un commento..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setIsCommentBoxOpen(false);
                setComment('');
              }}
            >
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Invio in corso...' : 'Invia Commento'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};