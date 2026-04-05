import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('gf_cookie_consent')) {
        setVisible(true);
      }
    } catch { /* storage blocked */ }
  }, []);

  const accept = () => {
    try { localStorage.setItem('gf_cookie_consent', 'accepted'); } catch {}
    setVisible(false);
  };

  const decline = () => {
    try { localStorage.setItem('gf_cookie_consent', 'declined'); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-background border-t border-border shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <Cookie className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm text-muted-foreground flex-1">
          We use essential cookies to ensure the platform works properly. We also use analytics cookies to improve your experience. 
          By clicking "Accept," you consent to our use of cookies.
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={decline}>Decline</Button>
          <Button size="sm" onClick={accept}>Accept</Button>
        </div>
      </div>
    </div>
  );
};
