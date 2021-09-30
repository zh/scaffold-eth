import axios from "axios";
import { usePoller } from "eth-hooks";
import { useState } from "react";

const tokenId = "edit-this"; // example: bitcoin-cash, fantom etc.

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
          url: `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`,
        };
        const result = await axios(options);
        if (result && result.data) {
          setPrice(parseFloat(result.data[tokenId]["usd"]));
        }
      }
    }
    getPrice();
  };
  usePoller(pollPrice, pollTime || 97770);

  return price;
}
