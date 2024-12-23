import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "@/components/ReviewCard";
import { NotificationsTab } from "@/components/dashboard/NotificationsTab";
import { ProfileTab } from "@/components/dashboard/ProfileTab";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("reviews");

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
          diagnosis_difficulty,
          symptoms_severity,
          has_medication,
          medication_effectiveness,
          healing_possibility,
          social_discomfort,
          condition:PATOLOGIE (
            Patologia
          )
        `)
        .eq('user_id', session.session.user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reviews">Le mie recensioni</TabsTrigger>
          <TabsTrigger value="notifications">Notifiche</TabsTrigger>
          <TabsTrigger value="profile">Profilo</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-6">
          {reviews?.length === 0 ? (
            <p className="text-gray-500">Non hai ancora scritto recensioni.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews?.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id.toString()}
                  title={review.title}
                  condition={review.condition.Patologia}
                  experience={review.experience}
                  diagnosisDifficulty={review.diagnosis_difficulty}
                  symptomsSeverity={review.symptoms_severity}
                  hasMedication={review.has_medication}
                  medicationEffectiveness={review.medication_effectiveness}
                  healingPossibility={review.healing_possibility}
                  socialDiscomfort={review.social_discomfort}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;