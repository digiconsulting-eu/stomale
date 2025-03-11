
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationsTab } from "@/components/dashboard/NotificationsTab";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { FavoritesTab } from "@/components/dashboard/FavoritesTab";
import { DashboardLoader } from "@/components/dashboard/DashboardLoader";
import { ReviewsList } from "@/components/dashboard/ReviewsList";
import { CommentsTab } from "@/components/dashboard/CommentsTab";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserReviews } from "@/hooks/useUserReviews";

const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "notifications"
  );

  const { data: session, isLoading: isSessionLoading } = useAuthSession();
  const { data: reviews, isLoading: isReviewsLoading } = useUserReviews(session?.user?.id);

  useEffect(() => {
    if (!isSessionLoading && !session) {
      navigate('/login', { state: { returnTo: '/dashboard' } });
    }
  }, [session, isSessionLoading, navigate]);

  if (isSessionLoading) {
    return <DashboardLoader />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-wrap overflow-x-auto pb-1 justify-start md:justify-center mb-4">
          <TabsTrigger value="notifications" className="px-2 md:px-4 py-1.5 text-sm md:text-base whitespace-nowrap">
            Notifiche
          </TabsTrigger>
          <TabsTrigger value="reviews" className="px-2 md:px-4 py-1.5 text-sm md:text-base whitespace-nowrap">
            Le mie recensioni
          </TabsTrigger>
          <TabsTrigger value="comments" className="px-2 md:px-4 py-1.5 text-sm md:text-base whitespace-nowrap">
            I miei commenti
          </TabsTrigger>
          <TabsTrigger value="favorites" className="px-2 md:px-4 py-1.5 text-sm md:text-base whitespace-nowrap">
            Patologie seguite
          </TabsTrigger>
          <TabsTrigger value="profile" className="px-2 md:px-4 py-1.5 text-sm md:text-base whitespace-nowrap">
            Profilo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="pt-2">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="reviews" className="pt-2">
          <ReviewsList reviews={reviews} isLoading={isReviewsLoading} />
        </TabsContent>

        <TabsContent value="comments" className="pt-2">
          <CommentsTab />
        </TabsContent>

        <TabsContent value="favorites" className="pt-2">
          <FavoritesTab />
        </TabsContent>

        <TabsContent value="profile" className="pt-2">
          <ProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
