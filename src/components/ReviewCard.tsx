
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Trash2, Heart, MessageCircle } from "lucide-react";
import { generateReviewPath } from "@/utils/urlUtils";

interface ReviewCardProps {
  id: number;
  title: string;
  condition: string;
  preview: string;
  date: string;
  username: string;
  likesCount?: number;
  commentsCount?: number;
  onDelete?: () => void;
}

export const ReviewCard = ({
  id,
  title,
  condition,
  preview,
  date,
  username,
  likesCount = 0,
  commentsCount = 0,
  onDelete,
}: ReviewCardProps) => {
  // Ensure counts are always valid numbers for Safari
  const displayCommentsCount = typeof commentsCount === 'number' && !isNaN(commentsCount) ? commentsCount : 0;
  const displayLikesCount = typeof likesCount === 'number' && !isNaN(likesCount) ? likesCount : 0;
  
  console.log(`ReviewCard ${id} rendering with Safari compatibility:`, {
    id,
    condition,
    title,
    commentsCount: displayCommentsCount,
    likesCount: displayLikesCount
  });
  
  // Ensure condition is a valid string to prevent routing errors in Safari
  const safeCondition = condition && typeof condition === 'string' ? condition.trim().toLowerCase() : '';
  
  // Check for valid ID value for Safari
  if (!id || typeof id !== 'number' || isNaN(id)) {
    console.error('Invalid review ID for Safari:', id);
    return null;
  }
  
  // Ensure title is valid for Safari
  const safeTitle = title && typeof title === 'string' ? title : 'Recensione senza titolo';
  
  // Generate the review path using our utility function
  const reviewPath = generateReviewPath(safeCondition, id, safeTitle);
  console.log('Generated review path for Safari:', reviewPath);

  return (
    <Card className="bg-white rounded-3xl border border-[#1EAEDB] shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-[#2C3E50] hover:text-primary">
            <Link to={reviewPath}>{safeTitle}</Link>
          </h3>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-2">{username || 'Anonimo'}</p>
        {safeCondition && (
          <Link 
            to={`/patologia/${safeCondition}`}
            className="inline-block px-4 py-1 bg-[#E4F1FF] text-primary rounded-full text-sm mb-3 hover:bg-primary/10"
          >
            {safeCondition ? safeCondition.toUpperCase() : 'CATEGORIA NON SPECIFICATA'}
          </Link>
        )}
        <p className="text-gray-600 line-clamp-2 mb-4">{preview || 'Nessun contenuto disponibile'}</p>
        
        {/* Likes and Comments counts - Now with red heart */}
        <div className="flex items-center gap-6 mb-4 text-gray-500">
          <Link to={reviewPath} className="flex items-center gap-2 hover:text-primary transition-colors">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="text-gray-600">{displayLikesCount}</span>
          </Link>
          <Link to={reviewPath} className="flex items-center gap-2 hover:text-primary transition-colors">
            <MessageCircle className="h-5 w-5 text-green-500" />
            <span className="text-gray-600">{displayCommentsCount}</span>
          </Link>
        </div>
        
        <Button 
          asChild 
          className="w-full bg-primary text-white hover:bg-primary-hover justify-center rounded-xl py-6"
        >
          <Link to={reviewPath} className="text-white">
            Leggi l'esperienza completa
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};
