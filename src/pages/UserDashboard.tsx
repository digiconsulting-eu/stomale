import { useState } from "react";
import { ReviewCard } from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { MessageSquare, Search, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { NotificationsTab } from "@/components/dashboard/NotificationsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const UserDashboard = () => {
  const { data: reviews } = useQuery({
    queryKey: ['user-reviews'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return [];

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          title,
          experience,
          created_at,
          condition:PATOLOGIE (
            Patologia
          )
        `)
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Button 
          asChild 
          className="h-auto py-6 text-lg flex gap-2 bg-primary hover:bg-primary/90"
        >
          <Link to="/nuova-recensione">
            <MessageSquare className="w-5 h-5" />
            Racconta la tua Esperienza
          </Link>
        </Button>
        
        <Button 
          asChild 
          className="h-auto py-6 text-lg flex gap-2 bg-secondary hover:bg-secondary/90 text-primary"
        >
          <Link to="/cerca-patologia">
            <Search className="w-5 h-5" />
            Cerca Patologia
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifiche
          </TabsTrigger>
          <TabsTrigger value="reviews">Le mie Recensioni</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="reviews">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {reviews?.map((review) => (
              <ReviewCard
                key={review.id}
                id={review.id}
                title={review.title}
                condition={review.condition.Patologia.toLowerCase()}
                preview={review.experience}
                date={new Date(review.created_at).toLocaleDateString('it-IT')}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;