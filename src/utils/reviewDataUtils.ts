
import { DatabaseReview, Review } from "@/types/review";

/**
 * Transforms database review data into safe, consistent format
 */
export const transformReviewData = (reviewData: any[]): Review[] => {
  if (!reviewData || !Array.isArray(reviewData) || reviewData.length === 0) {
    console.log('No valid review data to transform');
    return [];
  }
  
  console.log(`Transforming ${reviewData.length} reviews from database`);
  
  try {
    // Create a completely new array with primitive values to avoid proxy objects
    const safeData = reviewData
      .filter(review => review && typeof review === 'object')
      .map(review => {
        try {
          // Make sure PATOLOGIE exists and has valid data
          const patologie = review.PATOLOGIE || { id: 0, Patologia: 'Sconosciuta' };
          
          const safeReview: Review = {
            id: typeof review.id === 'number' ? review.id : Number(review.id || 0),
            title: String(review.title || 'Titolo non disponibile'),
            condition: patologie.Patologia ? patologie.Patologia.toLowerCase() : 'sconosciuta',
            experience: String(review.experience || 'Contenuto non disponibile'),
            username: String(review.username || 'Anonimo'),
            created_at: String(review.created_at || new Date().toISOString()),
            condition_id: typeof review.condition_id === 'number' ? review.condition_id : Number(review.condition_id || 0),
            likes_count: typeof review.likes_count === 'number' ? review.likes_count : Number(review.likes_count || 0),
            comments_count: typeof review.comments_count === 'number' ? review.comments_count : Number(review.comments_count || 0),
            PATOLOGIE: patologie
          };
          
          return safeReview;
        } catch (err) {
          console.error('Error transforming review:', err);
          return null;
        }
      })
      .filter(Boolean);
    
    console.log(`Successfully transformed ${safeData.length} reviews`);
    return safeData as Review[];
  } catch (error) {
    console.error('Error in transformReviewData:', error);
    return [];
  }
};
