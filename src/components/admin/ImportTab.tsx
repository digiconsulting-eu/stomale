
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewsImport } from "./import/ReviewsImport";
import { DescriptionsImport } from "./import/DescriptionsImport";

const ImportTab = () => {
  return (
    <Tabs defaultValue="reviews" className="space-y-4 md:space-y-6">
      <TabsList className="w-full flex overflow-x-auto pb-1 justify-start md:justify-center">
        <TabsTrigger value="reviews" className="flex-1 md:flex-none">Recensioni</TabsTrigger>
        <TabsTrigger value="descriptions" className="flex-1 md:flex-none">Descrizioni Patologie</TabsTrigger>
      </TabsList>

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
