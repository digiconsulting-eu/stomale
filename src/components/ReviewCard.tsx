interface ReviewCardProps {
  title: string;
  condition: string;
  preview: string;
  date: string;
}

export const ReviewCard = ({ title, condition, preview, date }: ReviewCardProps) => {
  return (
    <div className="card animate-fade-in">
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
  );
};