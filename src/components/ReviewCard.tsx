import { Link } from "react-router-dom";

interface ReviewCardProps {
  id: string;
  title: string;
  condition: string;
  preview: string;
  date: string;
}

export const ReviewCard = ({ id, title, condition, preview, date }: ReviewCardProps) => {
  return (
    <Link to={`/recensione/${id}`} className="block">
      <div className="card animate-fade-in hover:scale-[1.02] transition-transform">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-text">{title}</h3>
          <span className="text-sm text-text-light">{date}</span>
        </div>
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-secondary rounded-full text-sm text-text-light">
            {condition}
          </span>
        </div>
        <p className="text-text-light line-clamp-3">{preview}</p>
      </div>
    </Link>
  );
};