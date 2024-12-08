import { useEffect, useState } from "react";
import { ReviewCard } from "@/components/ReviewCard";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MessageSquare, Search } from "lucide-react";
import { Link } from "react-router-dom";

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Button 
          asChild 
          className="h-auto py-6 text-lg flex gap-2 bg-primary hover:bg-primary/90"
        >
          <Link to="/nuova-recensione">
            <MessageSquare className="w-5 h-5" />
            Racconta la tua Esperienza
          </Link>
        </Button>
        
        <Button 
          asChild 
          className="h-auto py-6 text-lg flex gap-2 bg-secondary hover:bg-secondary/90 text-primary"
        >
          <Link to="/cerca-patologia">
            <Search className="w-5 h-5" />
            Cerca Patologia
          </Link>
        </Button>
      </div>

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