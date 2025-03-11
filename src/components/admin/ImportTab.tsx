
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewsImport } from "./import/ReviewsImport";
import { DescriptionsImport } from "./import/DescriptionsImport";

const ImportTab = () => {
  return (
    <Tabs defaultValue="reviews" className="space-y-4 md:space-y-6">
      <div className="bg-gray-100 p-2 rounded-lg">
        <TabsList className="w-full grid grid-cols-2 gap-2 bg-transparent">
          <TabsTrigger value="reviews" className="w-full rounded text-center">Recensioni</TabsTrigger>
          <TabsTrigger value="descriptions" className="w-full rounded text-center">Descrizioni Patologie</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="reviews" className="space-y-4 md:space-y-6">
        <ReviewsImport />
      </TabsContent>

      <TabsContent value="descriptions" className="space-y-4 md:space-y-6">
        <DescriptionsImport />
      </TabsContent>
    </Tabs>
  );
};

export default ImportTab;
