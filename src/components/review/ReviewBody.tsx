interface ReviewBodyProps {
  symptoms: string;
  experience: string;
}

export const ReviewBody = ({ symptoms, experience }: ReviewBodyProps) => {
  return (
    <div className="prose prose-lg max-w-none mb-8">
      <h2 className="text-xl font-semibold mb-4">Sintomi</h2>
      <p className="whitespace-pre-wrap mb-6">{symptoms}</p>

      <h2 className="text-xl font-semibold mb-4">Esperienza</h2>
      <p className="whitespace-pre-wrap mb-8">{experience}</p>
    </div>
  );
};