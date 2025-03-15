
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const EmptyReviews = () => {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
      <p className="text-gray-500 mb-4">Non ci sono ancora recensioni approvate.</p>
      <Link to="/nuova-recensione">
        <Button className="bg-primary hover:bg-primary/90 text-white">
          Scrivi la prima recensione
        </Button>
      </Link>
    </div>
  );
};
