import { ComponentType, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';

interface WithAdminProps {
  [key: string]: any;
}

const withAdmin = <P extends object>(Component: ComponentType<P>) => {
  return (props: P & WithAdminProps) => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAdminStatus = async () => {
        if (!user) {
          navigate('/auth');
          return;
        }

        try {
          // Check if user has admin role in user_roles table
          const { data: userRoles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle();

          if (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(!!userRoles);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      };

      checkAdminStatus();
    }, [user, navigate]);

    useEffect(() => {
      if (!loading && !isAdmin) {
        navigate('/dashboard');
      }
    }, [loading, isAdmin, navigate]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-4"></div>
            <div className="h-4 bg-muted rounded w-32"></div>
          </div>
        </div>
      );
    }

    if (!isAdmin) {
      return null;
    }

    return <Component {...props} />;
  };
};

export default withAdmin;