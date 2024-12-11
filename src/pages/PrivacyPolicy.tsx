import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PrivacyPolicy = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(`
<h1>Privacy Policy</h1>

<p>Ultima modifica: ${new Date().toLocaleDateString()}</p>

<h2>Informativa sulla Privacy</h2>

<p>La presente informativa descrive le modalità di gestione del sito web in riferimento al trattamento dei dati personali degli utenti che lo consultano.</p>
  `);

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('type', 'privacy_policy')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching privacy policy:', error);
        toast.error("Errore durante il caricamento della privacy policy");
        return;
      }

      // If no data exists, create default privacy policy
      if (!data) {
        const { error: insertError } = await supabase
          .from('site_content')
          .insert({
            type: 'privacy_policy',
            content: content,
          });

        if (insertError) {
          console.error('Error inserting default privacy policy:', insertError);
          toast.error("Errore durante l'inizializzazione della privacy policy");
          return;
        }
      } else if (data?.content) {
        setContent(data.content);
      }
    };

    fetchContent();
  }, []);

  const handleSave = async () => {
    const { error } = await supabase
      .from('site_content')
      .upsert({
        type: 'privacy_policy',
        content: content,
      });

    if (error) {
      toast.error("Errore durante il salvataggio");
      return;
    }

    setIsEditing(false);
    toast.success("Contenuto salvato con successo");
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isAdmin && !isEditing && (
        <Button onClick={() => setIsEditing(true)} className="mb-4">
          Modifica Contenuto
        </Button>
      )}

      {isEditing ? (
        <div className="space-y-4">
          <RichTextEditor 
            content={content} 
            onChange={handleContentChange} 
            editable={true} 
          />
          <div className="space-x-2">
            <Button onClick={handleSave}>Salva</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annulla
            </Button>
          </div>
        </div>
      ) : (
        <div className="prose max-w-none">
          <RichTextEditor 
            content={content} 
            onChange={() => {}} 
            editable={false} 
          />
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicy;