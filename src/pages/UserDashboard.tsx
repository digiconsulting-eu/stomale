import { useEffect, useState } from "react";
import { ReviewCard } from "@/components/ReviewCard";
import { useQuery } from "@tanstack/react-query";

const UserDashboard = () => {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    const response = await fetch('/api/reviews'); // Update with the actual API endpoint
    const data = await response.json();
    setReviews(data);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Il tuo Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            id={review.id}
            title={review.title}
            condition={review.condition}
            preview={review.preview}
            date={review.date}
          />
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
