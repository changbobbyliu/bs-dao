import { ethers } from "ethers";
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

const vote = sdk.getVote(process.env.REACT_APP_GOV_ADDRESS!);
const token = sdk.getToken(process.env.REACT_APP_PKD_ADDRESS);

(async () => {
  try {
    // Create proposal to mint 420,000 new token to the treasury.
    const amount = 420_000;
    const description =
      "Should the DAO mint an additional " +
      amount +
      " tokens into the treasury?";
    const executions = [
      {
        // Our token contract that actually executes the mint.
        toAddress: token.getAddress(),
        // Our nativeToken is ETH. nativeTokenValue is the amount of ETH we want
        // to send in this proposal. In this case, we're sending 0 ETH.
        // We're just minting new tokens to the treasury. So, set to 0.
        nativeTokenValue: 0,
        // We're doing a mint! And, we're minting to the vote, which is
        // acting as our treasury.
        // in this case, we need to use ethers.js to convert the amount
        // to the correct format. This is because the amount it requires is in wei.
        transactionData: token.encoder.encode("mintTo", [
          vote.getAddress(),
          ethers.utils.parseUnits(amount.toString(), 18),
        ]),
      },
    ];

    await vote.propose(description, executions);

    console.log("✅ Successfully created proposal to mint tokens");
  } catch (error) {
    console.error("failed to create first proposal", error);
    process.exit(1);
  }

  try {
    // Create proposal to transfer ourselves 6,900 tokens for being awesome.
    const amount = 6_900;
    const description =
      "Should the DAO transfer " +
      amount +
      " tokens from the treasury to " +
      process.env.REACT_APP_WALLET_ADDRESS +
      " for being awesome?";
    const executions = [
      {
        // Again, we're sending ourselves 0 ETH. Just sending our own token.
        nativeTokenValue: 0,
        transactionData: token.encoder.encode(
          // We're doing a transfer from the treasury to our wallet.
          "transfer",
          [
            process.env.REACT_APP_WALLET_ADDRESS!,
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
        ),
        toAddress: token.getAddress(),
      },
    ];

    await vote.propose(description, executions);

    console.log(
      "✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!"
    );
  } catch (error) {
    console.error("failed to create second proposal", error);
  }
})();
