import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { capitalizeFirstLetter } from "@/utils/textUtils";

interface ReviewCardProps {
  id: string;
  title: string;
  condition: string;
  preview: string;
  date: string;
}

export const ReviewCard = ({ id, title, condition, preview, date }: ReviewCardProps) => {
  // Create URL-friendly slugs for condition and title
  const conditionSlug = condition.toLowerCase().replace(/\s+/g, '-');
  const titleSlug = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link to={`/patologia/${conditionSlug}/esperienza/${titleSlug}`} className="block group">
      <div className="card animate-fade-in group-hover:scale-[1.02] transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center text-text-light space-x-1">
            <Calendar size={14} />
            <span className="text-sm">{date}</span>
          </div>
        </div>
        <div className="mb-4">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {capitalizeFirstLetter(condition)}
          </span>
        </div>
        <p className="text-text-light line-clamp-3 leading-relaxed">{preview}</p>
      </div>
    </Link>
  );
};