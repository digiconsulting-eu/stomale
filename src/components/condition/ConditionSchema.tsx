
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { Review } from "@/types/review";

interface ConditionSchemaProps {
  condition: string;
  reviews: Review[];
  ratingValue: number;
}

export const ConditionSchema = ({ condition, reviews, ratingValue }: ConditionSchemaProps) => {
  return (
    <div 
      itemScope 
      itemType="https://schema.org/MedicalCondition"
      className="hidden"
    >
      <meta itemProp="name" content={capitalizeFirstLetter(condition)} />
      <meta itemProp="alternateName" content={condition.toUpperCase()} />
      
      {/* Aggregated Rating schema */}
      {reviews.length > 0 && (
        <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
          <meta itemProp="ratingValue" content={ratingValue.toFixed(1)} />
          <meta itemProp="bestRating" content="5" />
          <meta itemProp="worstRating" content="1" />
          <meta itemProp="ratingCount" content={String(reviews.length)} />
          <meta itemProp="reviewCount" content={String(reviews.length)} />
        </div>
      )}
    </div>
  );
};
