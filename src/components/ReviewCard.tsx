
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Heart, MessageCircle, Calendar } from "lucide-react";
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
  // Ensure comment count is always a valid number
  const displayCommentsCount = typeof commentsCount === 'number' && !isNaN(commentsCount) ? commentsCount : 0;
  const displayLikesCount = typeof likesCount === 'number' && !isNaN(likesCount) ? likesCount : 0;
  
  // Generate the review path using our utility function
  const reviewPath = generateReviewPath(condition, id, title);

  return (
    <Card className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{date}</span>
          <span className="mx-2">•</span>
          <span>{username}</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
          <Link to={reviewPath}>{title}</Link>
        </h3>
        
        <Link 
          to={`/patologia/${condition.trim().toLowerCase()}`}
          className="inline-block px-3 py-1 bg-blue-50 text-primary text-xs rounded-full mb-3 hover:bg-blue-100 transition-colors"
        >
          {condition.toUpperCase()}
        </Link>
        
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{preview}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-red-400" />
              <span>{displayLikesCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4 text-green-500" />
              <span>{displayCommentsCount}</span>
            </div>
          </div>
          
          <Button 
            asChild 
            variant="ghost"
            className="text-primary hover:text-primary-hover hover:bg-blue-50 p-0"
          >
            <Link to={reviewPath} className="flex items-center gap-1 text-sm font-medium">
              Leggi
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};
