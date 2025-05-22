 
import { useState, useEffect } from 'react';

 
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
 
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

 
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo re-ejecuta si el valor o el retraso cambian

  return debouncedValue;
}

export default useDebounce;