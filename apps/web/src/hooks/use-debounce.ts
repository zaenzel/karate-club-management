import { useEffect, useState } from 'react';

/** Tunda perubahan nilai sampai user berhenti mengetik. Generik, tidak tahu soal fitur apa pun. */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
