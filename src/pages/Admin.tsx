import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/card";
import { useAdminData } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ClipboardList, Users } from "lucide-react";

const Admin = () => {
  const { pendingReviews, users, isLoading } = useAdminData();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AdminHeader />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Link to="/admin/recensioni">
          <Card className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <ClipboardList className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Recensioni da moderare</h3>
                <p className="text-gray-500">
                  {pendingReviews?.length || 0} recensioni in attesa
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/admin/utenti">
          <Card className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Gestione Utenti</h3>
                <p className="text-gray-500">
                  {users?.length || 0} utenti registrati
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Admin;