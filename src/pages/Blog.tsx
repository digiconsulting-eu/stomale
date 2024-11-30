import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/BlogCard";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

// Temporary mock data - replace with actual API call
const MOCK_ARTICLES = [
  {
    id: "1",
    title: "Come gestire l'ansia: consigli pratici per il benessere mentale",
    imageUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    category: "Salute Mentale"
  },
  {
    id: "2",
    title: "L'importanza della prevenzione nelle malattie cardiovascolari",
    imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    category: "Cardiologia"
  },
  {
    id: "3",
    title: "Alimentazione e salute: il legame tra dieta e benessere",
    imageUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
    category: "Nutrizione"
  },
  {
    id: "4",
    title: "I benefici dello sport sulla salute fisica e mentale",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    category: "Sport"
  },
  {
    id: "5",
    title: "Sonno e salute: l'importanza di un buon riposo",
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55",
    category: "Benessere"
  },
  {
    id: "6",
    title: "Prevenzione e cura delle malattie stagionali",
    imageUrl: "https://images.unsplash.com/photo-1584362917165-526a968579e8",
    category: "Prevenzione"
  },
  {
    id: "7",
    title: "Stress cronico: come riconoscerlo e gestirlo",
    imageUrl: "https://images.unsplash.com/photo-1541199249251-f713e6145474",
    category: "Salute Mentale"
  }
];

const CATEGORIES = [
  "Tutte",
  "Salute Mentale",
  "Cardiologia",
  "Nutrizione",
  "Sport",
  "Benessere",
  "Prevenzione"
];

const Blog = () => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const [selectedCategory, setSelectedCategory] = React.useState("Tutte");

  const { data: articles = MOCK_ARTICLES, isLoading } = useQuery({
    queryKey: ["blog-articles"],
    queryFn: async () => {
      // Replace with actual API call
      return MOCK_ARTICLES;
    },
  });

  const filteredArticles = articles.filter(article => 
    selectedCategory === "Tutte" ? true : article.category === selectedCategory
  );

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Caricamento...</div>;
  }

  const [featuredArticle, ...otherArticles] = filteredArticles;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog</h1>
        {isAdmin && (
          <Button asChild>
            <Link to="/blog/nuovo">Aggiungi Articolo</Link>
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Featured and Top Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="md:col-span-1">
          {featuredArticle && <BlogCard {...featuredArticle} isFeature />}
        </div>
        <div className="md:col-span-1 grid grid-rows-3 gap-6">
          {otherArticles.slice(0, 3).map((article) => (
            <BlogCard key={article.id} {...article} />
          ))}
        </div>
      </div>

      {/* Additional Articles */}
      {otherArticles.length > 3 && (
        <>
          <h2 className="text-2xl font-semibold mb-6">Altri Articoli</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherArticles.slice(3).map((article) => (
              <BlogCard key={article.id} {...article} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Blog;