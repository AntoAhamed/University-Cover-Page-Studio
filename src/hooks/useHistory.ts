import { useState, useCallback } from 'react';

export function useHistory<T>(initialPresent: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialPresent);
  const [future, setFuture] = useState<T[]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture([present, ...future]);
    setPresent(previous);
  }, [canUndo, past, present, future]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast([...past, present]);
    setPresent(next);
    setFuture(newFuture);
  }, [canRedo, past, present, future]);

  const set = useCallback(
    (newPresent: T | ((curr: T) => T), saveToHistory = true) => {
      setPresent((current) => {
        const evaluated = typeof newPresent === 'function' ? (newPresent as (curr: T) => T)(current) : newPresent;
        if (saveToHistory) {
          setPast((prevPast) => [...prevPast.slice(-25), current]);
          setFuture([]);
        }
        return evaluated;
      });
    },
    []
  );

  const reset = useCallback((newPresent: T) => {
    setPresent(newPresent);
    setPast([]);
    setFuture([]);
  }, []);

  return {
    state: present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    reset
  };
}
