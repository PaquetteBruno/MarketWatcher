import { useState, useCallback, useMemo } from "react";
import globalService from "../services/globalService";

export function useGlobal() {
  const [globalData, setGlobalData] = useState([]);

  const loadGlobalData = useCallback(async (token) => {
    const data = await globalService.getGlobalData(token);
    setGlobalData(data);
  }, []);

  const clear = useCallback(() => {
    setGlobalData([]);
  }, []);

  return useMemo(
    () => ({
      globalData,
      loadGlobalData,
      clear,
    }),
    [globalData, loadGlobalData, clear],
  );
}

export default useGlobal;
