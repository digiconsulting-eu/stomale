
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
  // Enhanced validation
  if (!id || !title) {
    console.error('ReviewCard missing required data:', { id, title });
    return null;
  }
  
  // Make sure condition is always a string
  const safeCondition = condition?.trim() || 'Patologia non specificata';
  
  // Ensure counts are always valid numbers
  const displayCommentsCount = typeof commentsCount === 'number' && !isNaN(commentsCount) ? commentsCount : 0;
  const displayLikesCount = typeof likesCount === 'number' && !isNaN(likesCount) ? likesCount : 0;
  
  // Ensure preview is a valid string
  const safePreview = preview || 'Nessuna descrizione disponibile';
  
  // Ensure username is always a string
  const safeUsername = username || 'Anonimo';
  
  // Generate the review path using our utility function
  const reviewPath = generateReviewPath(safeCondition.toLowerCase(), id, title);

  // Create structured data for the review card
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "MedicalCondition",
      "name": capitalizeFirstLetter(safeCondition)
    },
    "author": {
      "@type": "Person",
      "name": safeUsername
    },
    "name": title,
    "reviewBody": safePreview,
    "datePublished": date
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />
      <Card className="w-full bg-white rounded-3xl border border-[#1EAEDB] shadow-sm overflow-visible h-full flex flex-col">
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-[#2C3E50] hover:text-primary">
              <Link to={reviewPath}>{title}</Link>
            </h3>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onDelete}
                aria-label="Elimina recensione"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-2">
            <span>{safeUsername}</span>
          </p>
          <Link 
            to={`/patologia/${safeCondition.toLowerCase()}`}
            className="inline-block px-4 py-1 bg-[#E4F1FF] text-primary rounded-full text-sm mb-3 hover:bg-primary/10"
          >
            <span>{safeCondition.toUpperCase()}</span>
          </Link>
          <p className="text-gray-600 line-clamp-3 mb-4 break-words flex-grow">{safePreview}</p>
          
          {/* Likes and Comments counts */}
          <div className="flex items-center gap-6 mb-4 text-gray-500">
            <Link to={reviewPath} className="flex items-center gap-2 hover:text-primary transition-colors" aria-label={`${displayLikesCount} mi piace`}>
              <Heart className="h-5 w-5 text-red-400" />
              <span className="text-gray-600">{displayLikesCount}</span>
            </Link>
            <Link to={reviewPath} className="flex items-center gap-2 hover:text-primary transition-colors" aria-label={`${displayCommentsCount} commenti`}>
              <MessageCircle className="h-5 w-5 text-green-500" />
              <span className="text-gray-600">{displayCommentsCount}</span>
            </Link>
          </div>
          
          <Button 
            asChild 
            className="w-full bg-primary text-white hover:bg-primary-hover justify-center rounded-xl py-2 md:py-6 mt-auto"
          >
            <Link to={reviewPath} className="text-white" aria-label={`Leggi l'esperienza completa su ${title}`}>
              Leggi l'esperienza completa
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </Card>
    </>
  );
};

// Helper function to capitalize first letter (copied from utils to avoid circular dependencies)
function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
