import { SearchBar } from "@/components/SearchBar";
import { ReviewCard } from "@/components/ReviewCard";

const SAMPLE_REVIEWS = [
  {
    id: "1",
    title: "La mia esperienza con l'emicrania cronica",
    condition: "Emicrania",
    preview: "Ho iniziato a soffrire di emicrania circa due anni fa...",
    date: "20-02-2024",
  },
  {
    id: "2",
    title: "Gestire l'artrite reumatoide",
    condition: "Artrite Reumatoide",
    preview: "Dopo la diagnosi, ho scoperto che ci sono molti modi per gestire i sintomi...",
    date: "19-02-2024",
  },
  {
    id: "3",
    title: "Il mio percorso con l'ansia",
    condition: "Disturbo d'Ansia",
    preview: "Ho imparato che l'ansia può essere gestita con il giusto supporto...",
    date: "18-02-2024",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-4 relative">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10" 
               style={{ backgroundImage: 'url("/hero-bg.png")' }} />
          <div className="container mx-auto text-center max-w-4xl relative z-10">
            <h1 className="text-5xl font-bold text-text mb-8 leading-tight">
              Condividi la tua esperienza, aiuta gli altri
            </h1>
            <p className="text-text-light text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Unisciti alla nostra community per condividere la tua esperienza e scoprire
              le storie di altri pazienti.
            </p>
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