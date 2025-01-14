import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationsTab } from "@/components/dashboard/NotificationsTab";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { FavoritesTab } from "@/components/dashboard/FavoritesTab";
import { DashboardLoader } from "@/components/dashboard/DashboardLoader";
import { ReviewsList } from "@/components/dashboard/ReviewsList";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserReviews } from "@/hooks/useUserReviews";

const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "reviews"
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reviews">Le mie recensioni</TabsTrigger>
          <TabsTrigger value="favorites">Patologie seguite</TabsTrigger>
          <TabsTrigger value="notifications">Notifiche</TabsTrigger>
          <TabsTrigger value="profile">Profilo</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews">
          <ReviewsList reviews={reviews} isLoading={isReviewsLoading} />
        </TabsContent>

        <TabsContent value="favorites">
          <FavoritesTab />
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