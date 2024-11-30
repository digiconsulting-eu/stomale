import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface BlogCardProps {
  id: string;
  title: string;
  imageUrl: string;
  isFeature?: boolean;
}

export const BlogCard = ({ id, title, imageUrl, isFeature = false }: BlogCardProps) => {
  return (
    <Link to={`/blog/${id}`} className="block hover:opacity-95 transition-opacity">
      <Card className={`overflow-hidden ${isFeature ? 'h-[600px]' : 'h-[300px]'}`}>
        <div className="relative h-full">
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <CardHeader className="absolute bottom-0 text-white">
            <h3 className={`font-bold ${isFeature ? 'text-2xl' : 'text-xl'}`}>
              {title}
            </h3>
          </CardHeader>
        </div>
      </Card>
    </Link>
  );
};