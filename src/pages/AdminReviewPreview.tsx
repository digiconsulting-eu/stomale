import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckSquare, XSquare, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/RichTextEditor";

export default function AdminReviewPreview() {
  const { reviewId } = useParams();
  const navigate = useNavigate();

  const { data: review, isLoading } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          PATOLOGIE (
            Patologia
          ),
          users (
            username
          )
        `)
        .eq('id', reviewId)
        .single();

      if (error) {
        console.error('Error fetching review:', error);
        throw error;
      }

      return data;
    }
  });

  const handleUpdateStatus = async (newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (error) throw error;

      toast.success(`Recensione ${newStatus === 'approved' ? 'approvata' : 'rifiutata'} con successo`);
      navigate('/admin');
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error(`Errore durante l'aggiornamento dello stato della recensione`);
    }
  };

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  if (!review) {
    return <div>Recensione non trovata</div>;
  }

  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/admin')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Torna alla dashboard
      </Button>

      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{review.title}</h1>
            <p className="text-gray-500">
              Patologia: {review.PATOLOGIE?.Patologia}
            </p>
            <p className="text-gray-500">
              Autore: {review.users?.username}
            </p>
            <p className="text-gray-500">
              Data: {new Date(review.created_at).toLocaleDateString('it-IT')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleUpdateStatus('approved')}
              className="gap-2"
              variant={review.status === 'approved' ? 'secondary' : 'default'}
              disabled={review.status === 'approved'}
            >
              <CheckSquare className="h-4 w-4" />
              Approva
            </Button>
            <Button
              onClick={() => handleUpdateStatus('rejected')}
              className="gap-2"
              variant="destructive"
              disabled={review.status === 'rejected'}
            >
              <XSquare className="h-4 w-4" />
              Rifiuta
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Sintomi</h2>
            <RichTextEditor content={review.symptoms} editable={false} />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Esperienza</h2>
            <RichTextEditor content={review.experience} editable={false} />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="font-semibold">Difficoltà di Diagnosi</p>
              <p>{review.diagnosis_difficulty}/5</p>
            </div>
            <div>
              <p className="font-semibold">Gravità dei Sintomi</p>
              <p>{review.symptoms_severity}/5</p>
            </div>
            <div>
              <p className="font-semibold">Efficacia della Cura</p>
              <p>{review.has_medication ? `${review.medication_effectiveness}/5` : 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold">Possibilità di Guarigione</p>
              <p>{review.healing_possibility}/5</p>
            </div>
            <div>
              <p className="font-semibold">Disagio Sociale</p>
              <p>{review.social_discomfort}/5</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}