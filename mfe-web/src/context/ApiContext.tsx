import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createPublicApi, type PublicApi } from '../api/client';

const Ctx = createContext<PublicApi | null>(null);

/** Fallback when Module Federation loads two React copies (different Context identity). */
let publicApiSingleton: PublicApi | null = null;

export function PublicApiProvider({ baseUrl, children }: { baseUrl: string; children: ReactNode }) {
  const api = useMemo(() => {
    const instance = createPublicApi(baseUrl);
    publicApiSingleton = instance;
    return instance;
  }, [baseUrl]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function usePublicApi(): PublicApi {
  const ctx = useContext(Ctx);
  if (ctx) return ctx;
  if (publicApiSingleton) return publicApiSingleton;
  throw new Error('PublicApiProvider missing');
}
