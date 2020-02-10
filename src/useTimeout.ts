import { useRef, useEffect, useCallback } from "react";

const useTimeout = (): [
  (callback: () => void, delay: number) => void,
  () => void
] => {
  const timer = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
  }, []);

  useEffect(() => clearTimer, []);

  const setTimer = useCallback((callback: () => void, delay: number) => {
    clearTimer();
    timer.current = setTimeout(() => {
      timer.current = null;
      callback();
    }, delay);
  }, []);

  return [setTimer, clearTimer];
};

export default useTimeout;
