import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CookiePolicy = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(`
<h1>Cookie Policy</h1>

<p>Ultima modifica: ${new Date().toLocaleDateString()}</p>

<h2>Cosa sono i cookie?</h2>

<p>I cookie sono piccoli file di testo che i siti visitati inviano al terminale dell'utente, dove vengono memorizzati, per poi essere ritrasmessi agli stessi siti alla visita successiva.</p>
  `);

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('type', 'cookie_policy')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching cookie policy:', error);
        toast.error("Errore durante il caricamento della cookie policy");
        return;
      }

      if (data?.content) {
        setContent(data.content);
      } else {
        // If no content exists, create default content
        const { error: insertError } = await supabase
          .from('site_content')
          .insert({
            type: 'cookie_policy',
            content: content
          });

        if (insertError) {
          console.error('Error inserting default cookie policy:', insertError);
          toast.error("Errore durante l'inizializzazione della cookie policy");
        }
      }
    };

    fetchContent();
  }, []);

  const handleSave = async () => {
    const { error } = await supabase
      .from('site_content')
      .upsert({
        type: 'cookie_policy',
        content: content,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving cookie policy:', error);
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

export default CookiePolicy;