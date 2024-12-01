import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";

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
    const savedContent = localStorage.getItem("cookiePolicyContent");
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("cookiePolicyContent", content);
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
          <RichTextEditor content={content} onChange={setContent} editable={true} />
          <div className="space-x-2">
            <Button onClick={handleSave}>Salva</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annulla
            </Button>
          </div>
        </div>
      ) : (
        <div className="prose max-w-none">
          <RichTextEditor content={content} onChange={() => {}} editable={false} />
        </div>
      )}
    </div>
  );
};

export default CookiePolicy;