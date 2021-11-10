import { notification } from "antd";
import { parseJsonMessage } from "./index";
import { GAS_PRICE } from "../constants";

const { ethers } = require("ethers");
const callbacks = {};
const DEBUG = true;

export default function CustomTransactor(providerOrSigner, gasPrice = GAS_PRICE) {
  if (typeof providerOrSigner !== "undefined") {
    // eslint-disable-next-line consistent-return
    return async (tx, callback) => {
      let signer;
      let network;
      let provider;
      if (ethers.Signer.isSigner(providerOrSigner) === true) {
        provider = providerOrSigner.provider;
        signer = providerOrSigner;
        network = providerOrSigner.provider && (await providerOrSigner.provider.getNetwork());
      } else if (providerOrSigner._isProvider) {
        provider = providerOrSigner;
        signer = providerOrSigner.getSigner();
        network = await providerOrSigner.getNetwork();
      }

      try {
        let result;
        if (tx instanceof Promise) {
          if (DEBUG) console.log("AWAITING TX", tx);
          result = await tx;
        } else {
          if (!tx.gasPrice) {
            tx.gasPrice = gasPrice;
          }
          if (!tx.gasLimit) {
            tx.gasLimit = ethers.utils.hexlify(120000);
          }
          if (DEBUG) console.log("RUNNING TX", tx);
          result = await signer.sendTransaction(tx);
        }
        if (DEBUG) console.log("RESULT:", result);

        if (callback) {
          callbacks[result.hash] = callback;
        }

        notification.info({
          message: "Transaction Sent",
          description: result.hash,
          placement: "bottomRight",
        });
        // on most networks BlockNative will update a transaction handler,
        // but locally we will set an interval to listen...
        if (callback) {
          const txResult = await tx;
          const listeningInterval = setInterval(async () => {
            console.log("CHECK IN ON THE TX", txResult, provider);
            const currentTransactionReceipt = await provider.getTransactionReceipt(txResult.hash);
            if (currentTransactionReceipt && currentTransactionReceipt.confirmations) {
              if (callback instanceof Function) callback({ ...txResult, ...currentTransactionReceipt });
              clearInterval(listeningInterval);
            }
          }, 500);
        }

        if (typeof result.wait === "function") {
          await result.wait();
        }

        return result;
      } catch (e) {
        if (DEBUG) console.log(e);
        // Accounts for Metamask and default signer on all networks
        const message = parseJsonMessage(e);

        notification.error({
          message: "Transaction Error",
          description: message,
        });
        if (callback && typeof callback === "function") {
          callback(e);
        }
      }
    };
  }
}
