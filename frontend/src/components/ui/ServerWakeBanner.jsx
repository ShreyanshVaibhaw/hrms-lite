import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { checkHealth } from '../../services/api';

export default function ServerWakeBanner() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const retryRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const tryConnect = async () => {
      try {
        await checkHealth();
        if (!mountedRef.current) return;
        setFading(true);
        setTimeout(() => {
          if (mountedRef.current) setVisible(false);
        }, 500);
      } catch {
        // Server not ready yet — retry will handle it
      }
    };

    tryConnect();

    retryRef.current = setInterval(() => {
      tryConnect();
    }, 5000);

    return () => {
      mountedRef.current = false;
      if (retryRef.current) clearInterval(retryRef.current);
    };
  }, []);

  useEffect(() => {
    if (!visible && retryRef.current) {
      clearInterval(retryRef.current);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 border-b border-blue-200 bg-blue-50 py-3 text-center transition-opacity duration-500 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>
          Connecting to server, please wait... This may take up to 30 seconds.
        </span>
      </div>
    </div>
  );
}
