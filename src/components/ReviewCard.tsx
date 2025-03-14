
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Heart, MessageCircle, Trash2 } from "lucide-react";
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
  // Ensure counts are always valid numbers
  const displayCommentsCount = typeof commentsCount === 'number' && !isNaN(commentsCount) ? commentsCount : 0;
  const displayLikesCount = typeof likesCount === 'number' && !isNaN(likesCount) ? likesCount : 0;
  
  console.log(`ReviewCard ${id} rendering:`, {
    id,
    condition,
    title,
    commentsCount: displayCommentsCount,
    likesCount: displayLikesCount
  });
  
  // Ensure condition is a valid string to prevent routing errors
  const safeCondition = condition && typeof condition === 'string' ? condition.trim().toLowerCase() : '';
  
  // Check for valid ID value
  if (!id || typeof id !== 'number' || isNaN(id)) {
    console.error('Invalid review ID:', id);
    return null;
  }
  
  // Ensure title is valid
  const safeTitle = title && typeof title === 'string' ? title : 'Recensione senza titolo';
  
  // Generate the review path using our utility function
  const reviewPath = generateReviewPath(safeCondition, id, safeTitle);
  console.log('Generated review path:', reviewPath);

  return (
    <Card className="bg-white rounded-2xl border border-[#1EAEDB]/30 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-[#2C3E50] hover:text-primary line-clamp-2">
            <Link to={reviewPath}>{safeTitle}</Link>
          </h3>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 ml-2"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="text-sm text-gray-500 mb-3">{username || 'Anonimo'} • <span className="text-gray-400">{date}</span></div>
        
        {safeCondition && (
          <Link 
            to={`/patologia/${safeCondition}`}
            className="self-start inline-block px-3 py-1 bg-[#E4F1FF] text-primary rounded-full text-sm mb-4 hover:bg-primary/10 transition-colors"
          >
            {safeCondition ? safeCondition.toUpperCase() : 'CATEGORIA NON SPECIFICATA'}
          </Link>
        )}
        
        <p className="text-gray-600 line-clamp-3 mb-6 flex-grow">{preview || 'Nessun contenuto disponibile'}</p>
        
        <div className="mt-auto">
          {/* Likes and Comments counts with filled red heart */}
          <div className="flex items-center gap-6 mb-4 text-gray-500">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 fill-red-500 text-red-500" stroke="red" />
              <span className="text-gray-600">{displayLikesCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              <span className="text-gray-600">{displayCommentsCount}</span>
            </div>
          </div>
          
          <Button 
            asChild 
            className="w-full bg-primary text-white hover:bg-primary-hover justify-center rounded-xl py-5"
          >
            <Link to={reviewPath} className="text-white">
              Leggi l'esperienza completa
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};
