import { SearchBar } from "@/components/SearchBar";
import { ReviewCard } from "@/components/ReviewCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

const SAMPLE_REVIEWS = [
  {
    id: "1",
    title: "La mia esperienza con l'emicrania cronica",
    condition: "Emicrania",
    preview: "Ho iniziato a soffrire di emicrania circa due anni fa...",
    date: "20-02-2024",
    username: "Anonimo 1"
  },
  {
    id: "2",
    title: "Gestire l'artrite reumatoide",
    condition: "Artrite Reumatoide",
    preview: "Dopo la diagnosi, ho scoperto che ci sono molti modi per gestire i sintomi...",
    date: "19-02-2024",
    username: "Anonimo 2"
  },
  {
    id: "3",
    title: "Il mio percorso con l'ansia",
    condition: "Disturbo d'Ansia",
    preview: "Ho imparato che l'ansia può essere gestita con il giusto supporto...",
    date: "18-02-2024",
    username: "Anonimo 3"
  },
];

const Index = () => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState("Condividi la tua esperienza, aiuta gli altri");
  const [description, setDescription] = useState(
    "Unisciti alla nostra community per condividere la tua esperienza e scoprire le storie di altri pazienti."
  );
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    toast.success("Titolo aggiornato con successo");
  };

  const handleSaveDescription = () => {
    setIsEditingDescription(false);
    toast.success("Descrizione aggiornata con successo");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-4 relative">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
            style={{ backgroundImage: 'url("/hero-bg-pills.png")' }}
          />
          <div className="container mx-auto text-center max-w-4xl relative z-10">
            {isEditingTitle ? (
              <div className="space-y-4">
                <Textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-4xl font-bold text-center min-h-[100px]"
                />
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingTitle(false);
                      setTitle(title);
                    }}
                  >
                    Annulla
                  </Button>
                  <Button onClick={handleSaveTitle}>Salva</Button>
                </div>
              </div>
            ) : (
              <div className="relative inline-block">
                <h1 className="text-5xl font-bold text-text mb-8 leading-tight">
                  {title}
                </h1>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-10 top-0"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {isEditingDescription ? (
              <div className="space-y-4">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xl text-center min-h-[100px]"
                />
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingDescription(false);
                      setDescription(description);
                    }}
                  >
                    Annulla
                  </Button>
                  <Button onClick={handleSaveDescription}>Salva</Button>
                </div>
              </div>
            ) : (
              <div className="relative inline-block">
                <p className="text-text-light text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                  {description}
                </p>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-10 top-0"
                    onClick={() => setIsEditingDescription(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            <SearchBar />
          </div>
        </section>

        {/* Latest Reviews Section */}
        <section className="py-20 px-4 bg-white/50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-semibold text-text mb-12 text-center">
              Ultime Recensioni
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {SAMPLE_REVIEWS.map((review) => (
                <ReviewCard key={review.id} {...review} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
