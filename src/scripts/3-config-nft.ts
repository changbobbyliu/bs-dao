import { readFileSync } from "fs";
import { join } from "path";
import { MaxUint256 } from "@ethersproject/constants";

import { sdk } from "./sdk";

(async () => {
  const editionDrop = await sdk.getEditionDrop(
    process.env.REACT_APP_POLKADAO_CONTRACT_ADDRESS || ""
  );
  const result1 = await editionDrop.createBatch([
    {
      name: "Broke Tofadot",
      description: "Broke Tofadot NFT gives ya access to the PolkaDAO",
      image: readFileSync(join(__dirname, "assets", "polkamember.png")),
    },
  ]);
  console.log("✅ Successfully created a new NFT in the drop!", result1);

  const result2 = await editionDrop.claimConditions.set(
    result1.at(0)?.id || 0,
    [
      {
        startTime: new Date(),
        maxQuantity: 50_000,
        price: 0,
        // The amount of NFTs people can claim in one transaction.
        quantityLimitPerTransaction: 1,
        // We set the wait between transactions to MaxUint256, which means
        // people are only allowed to claim once.
        waitInSeconds: MaxUint256,
      },
    ]
  );
  console.log("✅ Successfully set claim condition!", result2.receipt);
})().catch((error) => {
  console.error("❌ Errooooor:", error);
});
