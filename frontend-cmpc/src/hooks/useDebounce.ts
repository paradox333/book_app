// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

// Un hook personalizado para aplicar debounce a un valor
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Establece un temporizador que actualiza el valor debounced después de un retraso
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpia el temporizador si el valor o el retraso cambian (o el componente se desmonta)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo re-ejecuta si el valor o el retraso cambian

  return debouncedValue;
}

export default useDebounce;