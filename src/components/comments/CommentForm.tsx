
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session } from '@supabase/supabase-js';

interface CommentFormProps {
  reviewId: string;
  session: Session | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CommentForm = ({ reviewId, session, onCancel, onSuccess }: CommentFormProps) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error("Devi effettuare l'accesso per commentare");
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
          user_id: session.user.id,
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
      onSuccess();
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
