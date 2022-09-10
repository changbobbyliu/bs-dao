// Trans 90% to GOV contract as community treasury
import { sdk } from "./sdk";
import { config } from "dotenv";
config();

if (
  !process.env.REACT_APP_GOV_ADDRESS ||
  !process.env.REACT_APP_PKD_ADDRESS ||
  !process.env.REACT_APP_WALLET_ADDRESS
) {
  throw new Error("GOV or PKD address not found");
}

// This is our governance contract.
const vote = sdk.getVote(process.env.REACT_APP_GOV_ADDRESS!);

// This is our ERC-20 contract.
const token = sdk.getToken(process.env.REACT_APP_PKD_ADDRESS!);

(async () => {
  try {
    // Give our treasury the power to mint additional token if needed.
    await token.roles.grant("minter", vote.getAddress());

    console.log(
      "Successfully gave vote contract permissions to act on token contract"
    );
  } catch (error) {
    console.error(
      "failed to grant vote contract permissions on token contract",
      error
    );
    process.exit(1);
  }

  try {
    // Grab our wallet's token balance, remember -- we hold basically the entire supply right now!
    const ownedTokenBalance = await token.balanceOf(
      process.env.REACT_APP_WALLET_ADDRESS!
    );

    // Grab 90% of the supply that we hold.
    const ownedAmount = ownedTokenBalance.displayValue;
    const percent90 = (Number(ownedAmount) / 100) * 90;

    // Transfer 90% of the supply to our voting contract.
    await token.transfer(vote.getAddress(), percent90);

    console.log(
      "✅ Successfully transferred " + percent90 + " tokens to vote contract"
    );
  } catch (err) {
    console.error("failed to transfer tokens to vote contract", err);
  }
})();
