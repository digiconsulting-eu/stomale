import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/BlogCard";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Temporary mock data - replace with actual API call
const MOCK_ARTICLES = [
  {
    id: "1",
    title: "Come gestire l'ansia: consigli pratici per il benessere mentale",
    imageUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
  },
  {
    id: "2",
    title: "L'importanza della prevenzione nelle malattie cardiovascolari",
    imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
  },
  {
    id: "3",
    title: "Alimentazione e salute: il legame tra dieta e benessere",
    imageUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
  },
  // Add more articles as needed
];

const Blog = () => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const { data: articles = MOCK_ARTICLES, isLoading } = useQuery({
    queryKey: ["blog-articles"],
    queryFn: async () => {
      // Replace with actual API call
      return MOCK_ARTICLES;
    },
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Caricamento...</div>;
  }

  const [featuredArticle, ...otherArticles] = articles;

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-1">
          <BlogCard {...featuredArticle} isFeature />
        </div>
        <div className="md:col-span-1 grid grid-rows-3 gap-6">
          {otherArticles.map((article) => (
            <BlogCard key={article.id} {...article} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;