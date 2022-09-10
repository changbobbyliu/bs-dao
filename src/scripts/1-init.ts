import { readFileSync } from "fs";
import { join } from "path";
import { AddressZero } from "@ethersproject/constants";

import { sdk } from "./sdk";

(async () => {
  const image = readFileSync(join(__dirname, "assets", "polkamember.png"));

  // Deploy ERC1155 contract
  const editionDropAddress = await sdk.deployer.deployEditionDrop({
    name: "PolkaDAO Membership",
    description: 'The "PolkaDAO Membership" NFT',
    image,
    primary_sale_recipient: AddressZero,
  });

  // Get contract instance
  const editionDrop = await sdk.getEditionDrop(editionDropAddress);
  const metadata = await editionDrop.metadata.get();

  console.log(
    "✅ Successfully deployed editionDrop contract, address:",
    editionDropAddress
  );
  console.log("✅ editionDrop metadata:", metadata);
})().catch((error) => {
  console.error("❌ Errooooor:", error);
});
