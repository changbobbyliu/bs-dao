import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Wallet, providers } from "ethers";
import { config } from "dotenv";

config();

const provider = new providers.JsonRpcProvider(
  process.env.REACT_APP_ALCHEMY_API_URL
);
const wallet = new Wallet(process.env.REACT_APP_PRIVATE_KEY || "", provider);

export const sdk = new ThirdwebSDK(wallet);

const getSignerAddress = async () => sdk.getSigner()?.getAddress();
