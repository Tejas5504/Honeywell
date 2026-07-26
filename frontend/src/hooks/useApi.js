import { useState, useEffect, useCallback, useRef } from 'react';

export const useApi = (apiFunction, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const apiFunctionRef = useRef(apiFunction);
  apiFunctionRef.current = apiFunction;

  const execute = useCallback(async (...params) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunctionRef.current(...params);
      setData(result);
      return result;
    } catch (err) {
      const errorMsg = err?.detail || err?.message || 'An error occurred';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    execute();
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]); // Run once on mount if immediate is true

  return { data, loading, error, execute, refresh };
};
