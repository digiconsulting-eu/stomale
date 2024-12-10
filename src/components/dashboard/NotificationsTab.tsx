import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Update {
  id: number;
  condition: {
    Patologia: string;
  };
  update_type: string;
  created_at: string;
}

export const NotificationsTab = () => {
  const { data: updates } = useQuery({
    queryKey: ['condition-updates'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return [];

      const { data, error } = await supabase
        .from('condition_updates')
        .select(`
          id,
          update_type,
          created_at,
          condition:PATOLOGIE (
            Patologia
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Update[];
    }
  });

  if (!updates?.length) {
    return (
      <Card className="p-8 text-center">
        <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Non ci sono aggiornamenti al momento</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/cerca-patologia">Cerca una patologia da seguire</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <Card key={update.id} className="p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">
              Aggiornamento per {update.condition.Patologia}
            </h3>
          </div>
          <p className="text-gray-600 mt-1">
            {update.update_type}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {new Date(update.created_at).toLocaleDateString('it-IT')}
          </p>
        </Card>
      ))}
    </div>
  );
};