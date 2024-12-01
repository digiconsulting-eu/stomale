import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const ArticleDetail = () => {
  const { id } = useParams();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", id],
    queryFn: async () => {
      // Replace with actual API call
      return {
        id: "1",
        title: "Come gestire l'ansia: consigli pratici per il benessere mentale",
        content: "Lorem ipsum dolor sit amet...",
        imageUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
        category: "Salute Mentale"
      };
    },
  });

  const handleSave = async () => {
    try {
      // Here you would make an API call to save the changes
      toast.success("Modifiche salvate con successo");
      setIsEditing(false);
    } catch (error) {
      toast.error("Errore durante il salvataggio delle modifiche");
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Caricamento...</div>;
  }

  if (!article) {
    return <div className="container mx-auto px-4 py-8">Articolo non trovato</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {isAdmin && !isEditing && (
          <Button onClick={() => {
            setIsEditing(true);
            setEditedTitle(article.title);
            setEditedContent(article.content);
          }} className="mb-4">
            Modifica Articolo
          </Button>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-3xl font-bold"
            />
            <img
              src={article.imageUrl}
              alt={editedTitle}
              className="w-full h-[400px] object-cover rounded-lg mb-6"
            />
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[400px]"
            />
            <div className="flex gap-4">
              <Button onClick={handleSave}>Salva</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annulla
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-6">{article.title}</h1>
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-[400px] object-cover rounded-lg mb-6"
            />
            <div className="prose max-w-none">
              {article.content}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ArticleDetail;