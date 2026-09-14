import { startTransition, useEffect, useState } from "react";

type LazyMountProps = {
  isActive: boolean;
  children: React.ReactNode;
};

// Defers mounting children so an in-progress swipe stays smooth: the active
// item mounts immediately, inactive (+-1 neighbor) items mount via
// startTransition (low-priority, interruptible by touch input).
export const LazyMount = ({ isActive, children }: LazyMountProps) => {
  const [isReady, setIsReady] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setIsReady(true);
      return;
    }
    startTransition(() => setIsReady(true));
  }, [isActive]);

  return isReady ? children : null;
};
