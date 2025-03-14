
import { useEffect } from "react";
import { setPageTitle } from "@/utils/pageTitle";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedReviews } from "@/components/home/FeaturedReviews";

export default function Index() {
  useEffect(() => {
    setPageTitle("Stomale.info | Recensioni su malattie, sintomi e patologie");
  }, []);

  return (
    <div className="w-full overflow-hidden">
      <HeroSection />
      <FeaturedReviews />
    </div>
  );
}
