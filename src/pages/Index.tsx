
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewCard } from "@/components/ReviewCard";
import { SearchBar } from "@/components/SearchBar";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { setPageTitle } from "@/utils/pageTitle";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Helmet } from "react-helmet";

export default function Index() {
  useEffect(() => {
    setPageTitle("Stomale.info | Recensioni su malattie, sintomi e patologie");
  }, []);

  const { data: latestReviews, isLoading, isError, refetch } = useQuery({
    queryKey: ['latestReviews'],
    queryFn: async () => {
      console.log('Starting reviews fetch for homepage...');
      
      try {
        // Force a session refresh to clear any cached data
        await supabase.auth.refreshSession();
        
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            title,
            experience,
            username,
            created_at,
            condition_id,
            likes_count,
            comments_count,
            PATOLOGIE (
              id,
              Patologia
            )
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }

        console.log('Fetched reviews for homepage:', data);
        
        if (!data || data.length === 0) {
          console.log('No reviews returned from API');
          return [];
        }
        
        // Validate that the reviews contain necessary data
        const validReviews = data.filter(review => 
          review && 
          review.id && 
          review.title && 
          review.PATOLOGIE?.Patologia
        );
        
        console.log('Valid reviews after filtering:', validReviews.length);
        
        if (validReviews.length === 0 && data.length > 0) {
          console.warn('Reviews were found but none contain all required fields');
          // Log some example data to understand the structure
          console.warn('First review from API:', data[0]);
        }
        
        // Transform and standardize the data
        const normalizedReviews = validReviews.map(review => ({
          ...review,
          username: review.username || 'Anonimo',
          likes_count: typeof review.likes_count === 'number' ? review.likes_count : 0,
          comments_count: typeof review.comments_count === 'number' ? review.comments_count : 0,
          experience: review.experience || 'Nessuna esperienza descritta',
          // Ensure PATOLOGIE is present
          PATOLOGIE: review.PATOLOGIE || { id: 0, Patologia: 'Patologia non specificata' }
        }));
        
        return normalizedReviews;
      } catch (error) {
        console.error('Error in homepage reviews fetch:', error);
        toast.error("Errore nel caricamento delle recensioni");
        throw error;
      }
    },
    staleTime: 0, 
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3
  });

  // Force a refetch on mount
  useEffect(() => {
    console.log('Index component mounted, forcing refetch of reviews');
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Structured data for homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "StoMale.info",
    "url": "https://stomale.info/",
    "description": "Recensioni e testimonianze su malattie, sintomi e patologie scritte da pazienti per aiutare altri pazienti.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://stomale.info/cerca-patologia?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "StoMale.info",
    "url": "https://stomale.info",
    "logo": "https://stomale.info/logo.png",
    "sameAs": [],
    "description": "Piattaforma di condivisione di esperienze e recensioni su patologie e malattie in italiano."
  };

  // Reviews aggregate schema
  const reviewsAggregateSchema = latestReviews && latestReviews.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": latestReviews.slice(0, 10).map((review, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Review",
        "name": review.title,
        "author": {
          "@type": "Person",
          "name": review.username
        },
        "datePublished": new Date(review.created_at).toISOString(),
        "reviewBody": review.experience?.substring(0, 150) + "...",
        "itemReviewed": {
          "@type": "MedicalCondition",
          "name": review.PATOLOGIE?.Patologia
        }
      }
    }))
  } : null;

  if (isError) {
    console.error('Error loading reviews');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          <p>Si è verificato un errore nel caricamento delle recensioni.</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="description" content="Condividi la tua esperienza con una malattia o patologia e aiuta altri pazienti a capire meglio i sintomi e le cure disponibili." />
        <meta name="keywords" content="malattie, patologie, recensioni mediche, esperienze pazienti, sintomi, cure, trattamenti" />
        <meta property="og:title" content="StoMale.info | Recensioni su malattie, sintomi e patologie" />
        <meta property="og:description" content="Condividi la tua esperienza con una malattia o patologia e aiuta altri pazienti a capire meglio i sintomi e le cure disponibili." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stomale.info" />
        <meta property="og:image" content="https://stomale.info/og-image.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="StoMale.info | Recensioni su malattie, sintomi e patologie" />
        <meta name="twitter:description" content="Condividi la tua esperienza con una malattia o patologia e aiuta altri pazienti a capire meglio i sintomi e le cure disponibili." />
        <meta name="twitter:image" content="https://stomale.info/og-image.svg" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        {reviewsAggregateSchema && (
          <script type="application/ld+json">
            {JSON.stringify(reviewsAggregateSchema)}
          </script>
        )}
        <link rel="canonical" href="https://stomale.info/" />
      </Helmet>

      <div className="w-full overflow-visible">
        {/* Breadcrumbs per navigazione e SEO */}
        <div className="container mx-auto px-4 pt-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" aria-current="page">Home</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Hero Section with gradient */}
        <div className="relative py-20 overflow-visible bg-gradient-to-br from-blue-50 to-white">
          <div className="absolute inset-0 z-0 opacity-10 bg-repeat">
            <div className="absolute w-full h-full bg-[url('/hero-bg-pills.png')] bg-repeat opacity-50"></div>
          </div>
          <div className="container relative z-10 mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 animate-fade-in">
                Condividi la tua esperienza
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Aiuta altri pazienti condividendo la tua storia e scopri le esperienze di chi ha vissuto la tua stessa condizione
              </p>
              
              <div className="w-full max-w-xl mx-auto mb-12">
                <SearchBar />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <Link to="/nuova-recensione">
                  <Button className="w-full sm:w-auto text-base px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all">
                    Scrivi una recensione
                  </Button>
                </Link>
                <Link to="/cerca-patologia">
                  <Button variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-2 shadow-md hover:shadow-lg transition-all">
                    Esplora patologie
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" className="w-full h-20 -mt-1">
            <path 
              fill="#f9fafb" 
              fillOpacity="1" 
              d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            ></path>
          </svg>
        </div>
        
        {/* Reviews Section */}
        <section className="py-16 bg-gray-50 overflow-visible">
          <div className="container mx-auto px-4 overflow-visible">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-primary relative">
                <span className="relative z-10">Recensioni in evidenza</span>
                <span className="absolute -bottom-2 left-0 w-12 h-1.5 bg-blue-200 rounded-full"></span>
              </h2>
              <Link to="/recensioni" className="group">
                <Button variant="outline" className="border-2 border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-2">
                  Tutte le recensioni
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-sm h-[300px]">
                    <Skeleton className="h-5 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/4 mb-8" />
                    <Skeleton className="h-32 w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : latestReviews && latestReviews.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-visible">
                {latestReviews.map((review) => {
                  console.log(`Rendering review on homepage: ID ${review.id}, Title: ${review.title}, Condition: ${review.PATOLOGIE?.Patologia || 'Missing'}`);
                  
                  return (
                    <ReviewCard
                      key={review.id}
                      id={review.id}
                      title={review.title}
                      condition={review.PATOLOGIE?.Patologia || 'Patologia non specificata'}
                      date={new Date(review.created_at).toLocaleDateString()}
                      preview={review.experience?.slice(0, 150) + '...' || 'Nessuna esperienza descritta'}
                      username={review.username || 'Anonimo'}
                      likesCount={review.likes_count || 0}
                      commentsCount={review.comments_count || 0}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 mb-4">Non ci sono ancora recensioni approvate.</p>
                <Link to="/nuova-recensione">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Scrivi la prima recensione
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">
              Domande frequenti
            </h2>
            <div className="max-w-3xl mx-auto">
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Cos'è StoMale.info?</h3>
                  <p>StoMale.info è una piattaforma dove le persone possono condividere le proprie esperienze con malattie e patologie, aiutando altri pazienti a comprendere meglio sintomi, diagnosi e trattamenti da una prospettiva umana e personale.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Come posso scrivere una recensione?</h3>
                  <p>Puoi facilmente condividere la tua esperienza cliccando sul pulsante "Scrivi una recensione" e compilando il modulo con i dettagli della tua esperienza, della patologia e dei sintomi riscontrati.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Le informazioni sono verificate da medici?</h3>
                  <p>Le recensioni su StoMale.info sono esperienze personali e non sostituiscono il parere medico. Ti consigliamo sempre di consultare professionisti sanitari per diagnosi e trattamenti.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Come posso trovare recensioni su una patologia specifica?</h3>
                  <p>Puoi utilizzare la barra di ricerca nella parte superiore della pagina, oppure navigare tra le categorie di patologie nella sezione "Esplora patologie".</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
