import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";

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
    const savedContent = localStorage.getItem("privacyPolicyContent");
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("privacyPolicyContent", content);
    setIsEditing(false);
    toast.success("Contenuto salvato con successo");
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
          <RichTextEditor content={content} onChange={setContent} />
          <div className="space-x-2">
            <Button onClick={handleSave}>Salva</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annulla
            </Button>
          </div>
        </div>
      ) : (
        <div className="prose max-w-none">
          <RichTextEditor content={content} editable={false} />
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicy;