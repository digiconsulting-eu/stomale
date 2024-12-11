import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Terms = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(`
<h1>Termini e Condizioni</h1>

<p>Ultima modifica: ${new Date().toLocaleDateString()}</p>

<h2>Condizioni Generali di Utilizzo</h2>

<p>Le presenti condizioni generali di utilizzo regolano l'accesso e l'utilizzo del sito web StoMale.info.</p>
  `);

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('type', 'terms')
        .single();
      
      if (error) {
        console.error('Error fetching terms:', error);
        return;
      }

      if (data?.content) {
        setContent(data.content);
      }
    };

    fetchContent();
  }, []);

  const handleSave = async () => {
    const { error } = await supabase
      .from('site_content')
      .upsert({
        type: 'terms',
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

export default Terms;