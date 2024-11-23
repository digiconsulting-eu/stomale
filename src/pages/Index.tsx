import { SearchBar } from "@/components/SearchBar";
import { ReviewCard } from "@/components/ReviewCard";

const SAMPLE_REVIEWS = [
  {
    title: "La mia esperienza con l'emicrania cronica",
    condition: "Emicrania",
    preview: "Ho iniziato a soffrire di emicrania circa due anni fa...",
    date: "2024-02-20",
  },
  {
    title: "Gestire l'artrite reumatoide",
    condition: "Artrite Reumatoide",
    preview: "Dopo la diagnosi, ho scoperto che ci sono molti modi per gestire i sintomi...",
    date: "2024-02-19",
  },
  {
    title: "Il mio percorso con l'ansia",
    condition: "Disturbo d'Ansia",
    preview: "Ho imparato che l'ansia può essere gestita con il giusto supporto...",
    date: "2024-02-18",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-secondary to-white py-20">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold text-text mb-6">
              Condividi la tua esperienza, aiuta gli altri
            </h1>
            <p className="text-text-light text-lg mb-8 max-w-2xl mx-auto">
              Unisciti alla nostra community per condividere la tua esperienza e scoprire
              le storie di altri pazienti.
            </p>
            <SearchBar />
          </div>
        </section>

        {/* Latest Reviews Section */}
        <section className="py-16 container mx-auto">
          <h2 className="text-2xl font-semibold text-text mb-8">Ultime Recensioni</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_REVIEWS.map((review, index) => (
              <ReviewCard key={index} {...review} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;