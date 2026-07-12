import { useState } from "react";
import globalService from "../services/globalService";

export function useGlobal() {
  const [globalData, setGlobalData] = useState([]);

  const loadGlobalData = async (token) => {
    const data = await globalService.getGlobalData(token);
    setGlobalData(data);
  };

  const clear = () => {
    setGlobalData([]);
  };

  return {
    globalData,
    loadGlobalData,
    clear,
  };
}

export default useGlobal;
