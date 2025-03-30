
import { useEffect, useRef } from 'react';
import { checkSessionHealth } from '@/utils/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const SessionMonitor = () => {
  const navigate = useNavigate();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const checkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef(Date.now());
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track user activity
  const updateLastActivity = () => {
    lastActivityRef.current = Date.now();
  };

  useEffect(() => {
    // Add event listeners to track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateLastActivity);
    });

    // Set up periodic session check (every 5 minutes)
    checkTimerRef.current = setInterval(async () => {
      try {
        console.log('Session monitor: Regular session check...');
        const isSessionHealthy = await checkSessionHealth();
        
        if (!isSessionHealthy) {
          console.log('Session health check failed, showing warning');
          toast.warning('La tua sessione potrebbe essere scaduta. Sarai reindirizzato alla homepage.', {
            duration: 5000,
            onDismiss: () => {
              // Redirect to home and reload after toast is dismissed
              navigate('/', { replace: true });
              window.location.reload();
            }
          });
        }
      } catch (error) {
        console.error('Error in session check interval:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    // Force session refresh every 30 minutes regardless of activity
    refreshTimerRef.current = setInterval(async () => {
      try {
        console.log('Session monitor: Performing forced session refresh');
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Forced refresh error:', error);
          toast.error('Errore durante il refresh della sessione', {
            description: 'Si consiglia di aggiornare la pagina',
            action: {
              label: 'Aggiorna',
              onClick: () => window.location.reload(),
            },
          });
        } else if (data.session) {
          console.log('Forced session refresh successful');
        }
      } catch (error) {
        console.error('Error in forced session refresh:', error);
      }
    }, 30 * 60 * 1000); // Every 30 minutes

    // Check for inactivity and show warning (1 hour)
    sessionTimeoutRef.current = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current;
      const oneHourInMs = 60 * 60 * 1000;
      
      if (inactiveTime > oneHourInMs) {
        console.log('User inactive for more than an hour');
        toast.warning('Sei inattivo da più di un\'ora. Per continuare a utilizzare il sito è consigliabile aggiornare la pagina.', {
          duration: 10000,
          action: {
            label: 'Aggiorna pagina',
            onClick: () => window.location.reload(),
          }
        });
      }
    }, 10 * 60 * 1000); // Check every 10 minutes

    // Cleanup function
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
      
      if (checkTimerRef.current) clearInterval(checkTimerRef.current);
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (sessionTimeoutRef.current) clearInterval(sessionTimeoutRef.current);
    };
  }, [navigate]);

  // Listen for visibilitychange to refresh session when user returns to the tab
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, checking session health');
        await checkSessionHealth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null; // This is a non-visual component
};
