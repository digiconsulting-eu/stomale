import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CommentSectionProps {
  reviewId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ reviewId }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error('Il commento non può essere vuoto');
      return;
    }

    setIsSubmitting(true);

    try {
      // Implement comment submission logic here
      // This is a placeholder - you'll need to adjust based on your actual comments table structure
      const { error } = await supabase
        .from('COMMENTI')
        .insert({
          ReviewId: reviewId,
          Testo: comment,
          // Add other necessary fields like user ID, timestamp, etc.
        });

      if (error) throw error;

      toast.success('Commento inviato con successo');
      setComment('');
    } catch (error) {
      console.error('Errore durante l\'invio del commento:', error);
      toast.error('Impossibile inviare il commento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Commenti</h2>
      <form onSubmit={handleSubmitComment} className="space-y-4">
        <Textarea
          placeholder="Scrivi un commento..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px]"
        />
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Invio in corso...' : 'Invia Commento'}
        </Button>
      </form>
      {/* Future: Add a list of existing comments here */}
    </div>
  );
};