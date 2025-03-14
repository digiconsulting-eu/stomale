
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReviewLikeButtonProps {
  reviewId: string;
  initialLikesCount: number;
}

export const ReviewLikeButton = ({ reviewId, initialLikesCount }: ReviewLikeButtonProps) => {
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  
  useEffect(() => {
    try {
      const hasAlreadyLiked = localStorage.getItem(`review_liked_${reviewId}`) === 'true';
      if (hasAlreadyLiked) {
        setHasLiked(true);
      }
    } catch (error) {
      console.error('Error checking localStorage for likes:', error);
    }
  }, [reviewId]);
  
  const handleLike = async () => {
    if (isLiking || hasLiked) return;
    
    setIsLiking(true);
    
    try {
      // Store the current value to use in the API call
      const newLikesCount = likesCount + 1;
      
      setLikesCount(newLikesCount);
      setHasLiked(true);
      
      // Fetch the current likes count from the database to ensure accuracy
      const { data: currentReview } = await supabase
        .from('reviews')
        .select('likes_count')
        .eq('id', parseInt(reviewId))
        .single();
      
      // Use the database value (or fallback to our calculated value if fetch fails)
      const currentLikesCount = currentReview?.likes_count ?? (likesCount);
      const updatedLikesCount = currentLikesCount + 1;
      
      const { error } = await supabase
        .from('reviews')
        .update({ likes_count: updatedLikesCount })
        .eq('id', parseInt(reviewId));
        
      if (error) {
        console.error('Error updating likes count:', error);
        setLikesCount(likesCount); // Revert to original count
        setHasLiked(false);
        toast.error("Errore nell'aggiornamento dei like. Riprova più tardi.");
        return;
      }
      
      toast.success("Grazie per il tuo apprezzamento!");
      
      try {
        localStorage.setItem(`review_liked_${reviewId}`, 'true');
        console.log(`Like saved for review ${reviewId}`);
      } catch (storageError) {
        console.error('Error saving like to localStorage:', storageError);
      }
      
    } catch (error) {
      console.error('Error in like function:', error);
      setLikesCount(likesCount); // Revert to original count
      setHasLiked(false);
      toast.error("Si è verificato un errore. Riprova più tardi.");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="mt-6 flex justify-between items-center">
      <div className="text-gray-600 flex items-center gap-2">
        <Heart className={`h-5 w-5 ${hasLiked ? 'fill-red-500 text-red-500' : 'text-red-500'}`} />
        <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
      </div>
      
      <Button 
        variant="outline"
        className={`flex items-center ${hasLiked ? 'bg-red-50 text-red-500 border-red-200' : 'hover:bg-red-50 hover:text-red-500 hover:border-red-200'}`}
        onClick={handleLike}
        disabled={isLiking || hasLiked}
      >
        <Heart className={`h-5 w-5 ${hasLiked ? 'fill-red-500' : 'fill-red-500'}`} />
      </Button>
    </div>
  );
};
