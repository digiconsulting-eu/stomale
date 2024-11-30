import { useEffect, useState } from "react";
import { ReviewCard } from "@/components/ReviewCard";
import { useQuery } from "@tanstack/react-query";

const UserDashboard = () => {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    const response = await fetch('/api/reviews');
    const data = await response.json();
    setReviews(data);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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