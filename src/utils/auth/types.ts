
import { Database } from "@/integrations/supabase/types";

export type User = Database["public"]["Tables"]["users"]["Row"];
