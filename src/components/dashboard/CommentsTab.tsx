
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  status: string;
  review_id: number;
  reviews: {
    title: string;
  } | null;
}

export const CommentsTab = () => {
  const { data: comments, isLoading } = useQuery({
    queryKey: ['userComments'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return [];

      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          status,
          review_id,
          reviews (
            title
          )
        `)
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }

      return data as Comment[];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="h-20 animate-pulse bg-gray-100 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (!comments?.length) {
    return (
      <Card className="p-8 text-center">
        <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Non hai ancora scritto commenti</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/recensioni">Leggi le recensioni</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="font-medium text-gray-900">
                  {comment.reviews?.title || 'Recensione non disponibile'}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <span className={`text-sm px-2 py-1 rounded-full ${
                comment.status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {comment.status === 'approved' ? 'Approvato' : 'In attesa'}
              </span>
            </div>
            <p className="text-gray-700">{comment.content}</p>
            <Button asChild variant="link" className="p-0 h-auto">
              <Link to={`/recensione/${comment.review_id}`}>
                Vai alla recensione
              </Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
