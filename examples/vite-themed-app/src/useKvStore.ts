import { useState, useCallback } from "react";

interface KvStoreState {
  key: string;
  value: string;
  response: string;
  isLoading: boolean;
}

export function useKvStore() {
  const [state, setState] = useState<KvStoreState>({
    key: "",
    value: "",
    response: "",
    isLoading: false,
  });

  const setKey = useCallback((key: string) => {
    setState((prev) => ({ ...prev, key }));
  }, []);

  const setValue = useCallback((value: string) => {
    setState((prev) => ({ ...prev, value }));
  }, []);

  const request = useCallback(async (fn: () => Promise<Response>) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await fn();
      const json = await res.json();
      setState((prev) => ({
        ...prev,
        response: JSON.stringify(json, null, 2),
        isLoading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        response: String(err),
        isLoading: false,
      }));
    }
  }, []);

  const writeValue = useCallback(() => {
    return request(() =>
      fetch(`/api/kv/${state.key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: state.value }),
      }),
    );
  }, [state.key, state.value, request]);

  const readValue = useCallback(() => {
    return request(() => fetch(`/api/kv/${state.key}`));
  }, [state.key, request]);

  const deleteValue = useCallback(() => {
    return request(() => fetch(`/api/kv/${state.key}`, { method: "DELETE" }));
  }, [state.key, request]);

  return {
    key: state.key,
    value: state.value,
    response: state.response,
    isLoading: state.isLoading,
    setKey,
    setValue,
    writeValue,
    readValue,
    deleteValue,
  };
}
