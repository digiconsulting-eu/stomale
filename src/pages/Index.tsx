
import { useEffect } from "react";
import { setPageTitle } from "@/utils/pageTitle";
import { useHomeReviews } from "@/hooks/useHomeReviews";
import { BreadcrumbNav } from "@/components/home/BreadcrumbNav";
import { HomeSEO } from "@/components/home/HomeSEO";
import { HeroSection } from "@/components/home/HeroSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { CallToActionSection } from "@/components/home/CallToActionSection";
import { FaqSection } from "@/components/home/FaqSection";
import { HomeErrorDisplay } from "@/components/home/HomeErrorDisplay";

export default function Index() {
  const { 
    latestReviews, 
    isLoading, 
    isError, 
    error, 
    refetch,
    structuredData,
    organizationSchema,
    reviewsAggregateSchema
  } = useHomeReviews();

  useEffect(() => {
    setPageTitle("Stomale.info | Recensioni su malattie, sintomi e patologie");
  }, []);

  if (isError) {
    console.error('Error loading reviews:', error);
    return <HomeErrorDisplay error={error} refetch={refetch} />;
  }

  return (
    <>
      <HomeSEO 
        structuredData={structuredData}
        organizationSchema={organizationSchema}
        reviewsAggregateSchema={reviewsAggregateSchema}
      />

      <div className="w-full overflow-visible">
        <BreadcrumbNav />
        <HeroSection />
        <ReviewsSection latestReviews={latestReviews} isLoading={isLoading} />
        <CallToActionSection />
        <FaqSection />
      </div>
    </>
  );
}
