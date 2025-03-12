
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
import { supabase } from "@/integrations/supabase/client";

const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "notifications"
  );
  const [username, setUsername] = useState<string | null>(null);

  const { data: session, isLoading: isSessionLoading } = useAuthSession();
  const { data: reviews, isLoading: isReviewsLoading } = useUserReviews(session?.user?.id);

  useEffect(() => {
    if (!isSessionLoading && !session) {
      navigate('/login', { state: { returnTo: '/dashboard' } });
    }
  }, [session, isSessionLoading, navigate]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('id', session.user.id)
          .single();
        
        if (!error && data) {
          setUsername(data.username);
        }
      }
    };

    fetchUserInfo();
  }, [session]);

  if (isSessionLoading) {
    return <DashboardLoader />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 mb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-0">Dashboard</h1>
        {session && username && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p><span className="font-semibold">Email:</span> {session.user.email}</p>
            <p><span className="font-semibold">Username:</span> {username}</p>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-gray-100 p-2 rounded-lg mb-6">
          <TabsList className="w-full grid grid-cols-3 md:flex md:flex-row gap-2 bg-transparent">
            <TabsTrigger 
              value="notifications" 
              className="w-full md:w-auto rounded text-center px-3 md:px-4"
            >
              Notifiche
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="w-full md:w-auto rounded text-center px-3 md:px-4"
            >
              Recensioni
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              className="w-full md:w-auto rounded text-center px-3 md:px-4"
            >
              Commenti
            </TabsTrigger>
            <TabsTrigger 
              value="favorites" 
              className="w-full md:w-auto rounded text-center px-3 md:px-4"
            >
              Patologie
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="w-full md:w-auto rounded text-center px-3 md:px-4"
            >
              Profilo
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-48 relative pb-20">
          <TabsContent value="notifications" className="mt-0">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <ReviewsList reviews={reviews} isLoading={isReviewsLoading} />
          </TabsContent>

          <TabsContent value="comments" className="mt-0">
            <CommentsTab />
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            <FavoritesTab />
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <ProfileTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
