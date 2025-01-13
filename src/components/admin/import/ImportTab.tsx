import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewsImport } from "./import/ReviewsImport";
import { DescriptionsImport } from "./import/DescriptionsImport";

const ImportTab = () => {
  return (
    <Tabs defaultValue="reviews" className="space-y-6">
      <TabsList>
        <TabsTrigger value="reviews">Recensioni</TabsTrigger>
        <TabsTrigger value="descriptions">Descrizioni Patologie</TabsTrigger>
      </TabsList>

      <TabsContent value="reviews" className="space-y-6">
        <ReviewsImport />
      </TabsContent>

      <TabsContent value="descriptions" className="space-y-6">
        <DescriptionsImport />
      </TabsContent>
    </Tabs>
  );
};

export default ImportTab;