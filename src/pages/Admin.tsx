import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { useAdminData } from "@/hooks/useAdminData";
import { useState } from "react";

const Admin = () => {
  const {
    pendingReviews,
    users,
    admins,
    isLoading,
    addAdmin,
    updateReviewStatus,
  } = useAdminData();

  const [newAdminEmail, setNewAdminEmail] = useState("");

  const handleAddAdmin = () => {
    if (newAdminEmail) {
      addAdmin(newAdminEmail);
      setNewAdminEmail("");
    }
  };

  const handleReviewAction = (id: number, action: "approve" | "reject") => {
    updateReviewStatus({ reviewId: id, status: action === "approve" ? "approved" : "removed" });
  };

  const handleCommentAction = (id: string, action: "approve" | "reject") => {
    // Implement comment moderation logic here
    console.log("Comment action:", id, action);
  };

  const markNotificationAsRead = (id: string) => {
    // Implement notification marking logic here
    console.log("Marking notification as read:", id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader />
      
      <AdminTabs
        notifications={[]} // We'll implement notifications later
        reviews={pendingReviews || []}
        comments={[]} // We'll implement comments later
        admins={admins || []}
        newAdminEmail={newAdminEmail}
        setNewAdminEmail={setNewAdminEmail}
        handleAddAdmin={handleAddAdmin}
        handleReviewAction={handleReviewAction}
        handleCommentAction={handleCommentAction}
        markNotificationAsRead={markNotificationAsRead}
      />
    </div>
  );
};

export default Admin;