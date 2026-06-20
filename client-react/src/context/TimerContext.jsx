import { useState, useEffect } from "react";

export function TimerProvider({ children }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTick((prevTick) => {
        const nextTick = prevTick + 1;
        // Dispatch a standard global event every minute
        window.dispatchEvent(new CustomEvent("app-tick", { detail: nextTick }));
        return nextTick;
      });
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return <div data-tick={tick}>{children}</div>;
}
