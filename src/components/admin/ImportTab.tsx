
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewsImport } from "./import/ReviewsImport";
import { DescriptionsImport } from "./import/DescriptionsImport";

const ImportTab = () => {
  return (
    <Tabs defaultValue="reviews" className="space-y-4 md:space-y-6">
      <div className="bg-gray-100 p-2 rounded-lg mb-4">
        <TabsList className="w-full grid grid-cols-2 gap-2 bg-transparent">
          <TabsTrigger value="reviews" className="w-full rounded text-center">Recensioni</TabsTrigger>
          <TabsTrigger value="descriptions" className="w-full rounded text-center">Descrizioni Patologie</TabsTrigger>
        </TabsList>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-32 relative pb-10">
        <TabsContent value="reviews" className="mt-0">
          <ReviewsImport />
        </TabsContent>

        <TabsContent value="descriptions" className="mt-0">
          <DescriptionsImport />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default ImportTab;
