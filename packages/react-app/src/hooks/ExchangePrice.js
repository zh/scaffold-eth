import axios from "axios";
import { usePoller } from "eth-hooks";
import { useState } from "react";

export default function useExchangePrice(targetNetwork, pollTime) {
  const [price, setPrice] = useState(0);

  const pollPrice = () => {
    async function getPrice() {
      if (targetNetwork.price) {
        setPrice(targetNetwork.price);
      } else {
        const options = {
          method: "GET",
          headers: { "content-type": "application/json" },
          url: `https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd`,
        };
        const result = await axios(options);
        if (result && result.data) {
          setPrice(parseFloat(result.data["avalanche-2"]["usd"]));
        }
      }
    }
    getPrice();
  };
  usePoller(pollPrice, pollTime || 97770);

  return price;
}
