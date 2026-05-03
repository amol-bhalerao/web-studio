import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createApi, type Api } from '../api/client';

const Ctx = createContext<Api | null>(null);

/** Fallback when Module Federation loads two React copies (different Context identity). */
let apiSingleton: Api | null = null;

export function ApiProvider({
  baseUrl,
  children,
}: {
  baseUrl: string;
  children: ReactNode;
}) {
  const api = useMemo(() => {
    const instance = createApi(baseUrl);
    apiSingleton = instance;
    return instance;
  }, [baseUrl]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useApi(): Api {
  const ctx = useContext(Ctx);
  if (ctx) return ctx;
  if (apiSingleton) return apiSingleton;
  throw new Error('ApiProvider missing');
}
