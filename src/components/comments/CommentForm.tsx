
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface CommentFormProps {
  reviewId: string;
  onCancel: () => void;
  onCommentSubmitted: () => void;
  userId: string | undefined;
}

export const CommentForm = ({ reviewId, onCancel, onCommentSubmitted, userId }: CommentFormProps) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("Devi effettuare l'accesso per commentare");
      navigate('/login');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Il commento non può essere vuoto');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          review_id: parseInt(reviewId),
          content: comment.trim(),
          user_id: userId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting comment:', error);
        throw error;
      }

      console.log('Comment submitted successfully:', data);
      toast.success('Commento inviato con successo! Verrà pubblicato dopo la revisione.');
      setComment('');
      onCommentSubmitted();
    } catch (error) {
      console.error('Errore durante l\'invio del commento:', error);
      toast.error('Impossibile inviare il commento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          onClick={onCancel}
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
  );
};
