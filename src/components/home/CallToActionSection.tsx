
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, PenTool } from "lucide-react";

export const CallToActionSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-4xl mx-auto">
          <Link to="/cerca-patologia" className="flex-1">
            <Button 
              variant="outline" 
              className="w-full h-16 text-base border-2 border-primary/20 hover:border-primary hover:bg-primary/5 flex items-center gap-3 transition-all duration-300 hover:shadow-lg"
            >
              <Search className="h-5 w-5 text-primary" />
              <span className="font-medium">Cerca Patologia</span>
            </Button>
          </Link>
          
          <Link to="/recensioni" className="flex-1">
            <Button 
              variant="outline" 
              className="w-full h-16 text-base border-2 border-primary/20 hover:border-primary hover:bg-primary/5 flex items-center gap-3 transition-all duration-300 hover:shadow-lg"
            >
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-medium">Tutte le recensioni</span>
            </Button>
          </Link>
          
          <Link to="/nuova-recensione" className="flex-1">
            <Button 
              className="w-full h-16 text-base bg-primary hover:bg-primary/90 text-white flex items-center gap-3 transition-all duration-300 hover:shadow-lg"
            >
              <PenTool className="h-5 w-5" />
              <span className="font-medium">Racconta la tua esperienza</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
