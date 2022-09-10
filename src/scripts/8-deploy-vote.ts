import { sdk } from "./sdk";
import { config } from "dotenv";
config();

const votingTokenAddress = process.env.REACT_APP_PKD_ADDRESS;

if (!votingTokenAddress) {
  throw new Error("Voting token address not found");
}

(async () => {
  try {
    const voteContractAddress = await sdk.deployer.deployVote({
      // Give your governance contract a name.
      name: "PolkaDAO Governance Contract",
      voting_token_address: votingTokenAddress,
      voting_delay_in_blocks: 0,

      // How long do members have to vote on a proposal when it's created?
      // we will set it to 1 day = 6570 blocks
      voting_period_in_blocks: 6570,

      // The minimum % of the total supply that need to vote for
      // the proposal to be valid after the time for the proposal has ended.
      voting_quorum_fraction: 0,

      // What's the minimum # of tokens a user needs to be allowed to create a proposal?
      // I set it to 0. Meaning no tokens are required for a user to be allowed to
      // create a proposal.
      proposal_token_threshold: 0,
    });

    console.log(
      "✅ Successfully deployed vote contract, address:",
      voteContractAddress
    );
  } catch (err) {
    console.error("Failed to deploy vote contract", err);
  }
})();
