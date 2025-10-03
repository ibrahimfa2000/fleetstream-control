import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  const [role, setRole] = useState<'admin' | 'customer' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        // @ts-ignore - Types will be generated after migration
        const { data: userRole } = await (supabase as any)
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        setRole(userRole?.role || 'customer');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('customer');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { role, isAdmin: role === 'admin', loading };
};
