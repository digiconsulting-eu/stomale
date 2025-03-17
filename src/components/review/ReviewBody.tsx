
interface ReviewBodyProps {
  symptoms: string;
  experience: string;
}

export const ReviewBody = ({ symptoms, experience }: ReviewBodyProps) => {
  return (
    <div className="prose prose-lg max-w-none space-y-8 overflow-hidden">
      <div>
        <h2 className="text-xl font-semibold mb-4">Sintomi</h2>
        <div className="bg-gray-50 rounded-lg p-4 md:p-6 overflow-hidden">
          <p 
            className="whitespace-pre-wrap text-gray-700 break-words" 
            itemProp="description"
            itemScope 
            itemType="https://schema.org/MedicalSymptom"
          >
            <span itemProp="name">{symptoms}</span>
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Esperienza</h2>
        <article 
          itemScope 
          itemType="http://schema.org/Article"
          className="bg-gray-50 rounded-lg p-4 md:p-6 overflow-hidden"
        >
          <meta itemProp="headline" content="Esperienza con la patologia" />
          <div itemProp="articleBody">
            <p className="whitespace-pre-wrap text-gray-700 break-words">
              {experience}
            </p>
          </div>
          <meta itemProp="datePublished" content={new Date().toISOString()} />
          <meta itemProp="author" content="Paziente con esperienza diretta" />
        </article>
      </div>
    </div>
  );
};
