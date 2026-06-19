'use client';

import { useEffect, useRef } from 'react';

/**
 * Live data sync without page refresh.
 * - 'simcha:sync'  — custom event fired in the SAME tab right after a write.
 * - 'storage'      — fired by the browser in OTHER tabs/windows when localStorage
 *                    changes (e.g. the client signs on the public /sign page in
 *                    another tab → the owner's open dashboard updates instantly).
 * A light poll is kept as a safety net.
 */
export function useSync(callback: () => void, pollMs = 4000) {
  const cb = useRef(callback);
  cb.current = callback;

  useEffect(() => {
    const handler = () => cb.current();
    window.addEventListener('simcha:sync', handler);
    window.addEventListener('storage', handler);
    const id = pollMs ? window.setInterval(handler, pollMs) : 0;
    return () => {
      window.removeEventListener('simcha:sync', handler);
      window.removeEventListener('storage', handler);
      if (id) window.clearInterval(id);
    };
  }, [pollMs]);
}
