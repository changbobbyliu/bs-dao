import { AddressZero } from "@ethersproject/constants";
import { sdk } from "./sdk";

(async () => {
  try {
    // Deploy a standard ERC-20 contract.
    const tokenAddress = await sdk.deployer.deployToken({
      // What's your token's name? Ex. "Ethereum"
      name: "PolkaDAO Governance Token",
      // What's your token's symbol? Ex. "ETH"
      symbol: "PKD",
      // This will be in case we want to sell our token,
      // because we don't, we set it to AddressZero again.
      primary_sale_recipient: AddressZero,
    });
    console.log(
      "✅ Successfully deployed token module, address:",
      tokenAddress
    );
  } catch (error) {
    console.error("failed to deploy token module", error);
  }
})();
