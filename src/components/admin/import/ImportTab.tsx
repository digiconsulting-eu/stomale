
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewsImport } from "./ReviewsImport";
import { DescriptionsImport } from "./DescriptionsImport";
import { UsersImport } from "./UsersImport";

const ImportTab = () => {
  return (
    <Tabs defaultValue="reviews" className="space-y-6">
      <TabsList>
        <TabsTrigger value="reviews">Recensioni</TabsTrigger>
        <TabsTrigger value="descriptions">Descrizioni Patologie</TabsTrigger>
        <TabsTrigger value="users">Utenti</TabsTrigger>
      </TabsList>

      <TabsContent value="reviews" className="space-y-6">
        <ReviewsImport />
      </TabsContent>

      <TabsContent value="descriptions" className="space-y-6">
        <DescriptionsImport />
      </TabsContent>

      <TabsContent value="users" className="space-y-6">
        <UsersImport />
      </TabsContent>
    </Tabs>
  );
};

export default ImportTab;
