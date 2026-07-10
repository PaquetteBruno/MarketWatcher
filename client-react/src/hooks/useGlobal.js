import { useState } from "react";

export function useGlobal() {
  const [globalData, setGlobalData] = useState([]);

  const clear = () => {
    setGlobalData([]);
  };

  return {
    globalData,
    setGlobalData,
    clear,
  };
}

export default useGlobal;
