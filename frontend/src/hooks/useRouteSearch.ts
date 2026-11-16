import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { RouteDto, RouteSearchParams } from '../types';

type Status = 'idle' | 'loading' | 'ok' | 'error';

const MAX_CACHE = 40;
const cache = new Map<string, RouteDto[]>();

/** Call after anything that changes availability (e.g. an admin cancels or delays a service). */
export const clearRouteCache = () => cache.clear();

/**
 * Runs a route search whenever `params` changes.
 *  - debounced (default 250 ms): clicking three filters quickly sends ONE request
 *  - previous request is aborted, so a slow old answer can never overwrite a newer one
 *  - identical searches are answered from memory instantly
 *  - the old list stays on screen (dimmed) while loading: no spinner-flash, no layout jump
 */
export function useRouteSearch(params: RouteSearchParams | null, debounceMs = 250) {
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const key = params ? JSON.stringify(params) : '';

  useEffect(() => {
    if (!params) return;
    const hit = cache.get(key);
    if (hit) { setRoutes(hit); setError(''); setStatus('ok'); return; }

    setStatus('loading');
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const data = await api.routes.search(params, ctrl.signal);
        if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value as string);
        cache.set(key, data);
        setRoutes(data); setError(''); setStatus('ok');
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setRoutes([]); setError(e?.message || 'No routes found'); setStatus('error');
      }
    }, debounceMs);

    return () => { clearTimeout(timer); ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { routes, status, error, isStale: status === 'loading' && routes.length > 0 };
}
