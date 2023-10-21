import { eden } from "shared";
import { useMemo } from "react";

/**
 * re-exports the `edenTreaty` client for the API
 */
export function useEden() {
  // TODO: use the correct url for the hosted app (if deployed/prod)
  const api = useMemo(() => eden("http://localhost:3000"), []);

  return { api };
}
