import { usePoller } from "eth-hooks";
import { useState } from "react";

export default function useGasPrice(targetNetwork) {
  const [gasPrice, setGasPrice] = useState();
  const loadGasPrice = async () => {
    setGasPrice(targetNetwork.gasPrice || 1050000000);
  };

  usePoller(loadGasPrice, 39999);
  return gasPrice;
}
