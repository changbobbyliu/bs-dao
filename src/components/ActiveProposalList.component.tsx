import { Proposal } from "@thirdweb-dev/sdk";
import { FC } from "react";
import { AddressZero } from "@ethersproject/constants";
import { useAddress, useToken, useVote } from "@thirdweb-dev/react";

type TProps = {
  hasVoted: boolean;
  isVoting: boolean;
  setIsVoting: (isVoting: boolean) => void;
  setHasVoted: (hasVoted: boolean) => void;
  proposals: Proposal[];
};

export const ActiveProposalList: FC<TProps> = ({
  hasVoted,
  isVoting,
  setIsVoting,
  setHasVoted,
  proposals,
}) => {
  const address = useAddress();
  const token = useToken(process.env.REACT_APP_PKD_ADDRESS);
  const vote = useVote(process.env.REACT_APP_GOV_ADDRESS);

  return (
    <div className="mt-4 w-full">
      <h2 className="text-center font-bold mt-4 text-cyan-700 uppercase">
        Active Proposals
      </h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();

          //before we do async things, we want to disable the button to prevent double clicks
          setIsVoting(true);

          // lets get the votes from the form for the values
          const votes = proposals.map((proposal) => {
            const voteResult = {
              proposalId: proposal.proposalId,
              //abstain by default
              vote: 2,
            };
            proposal.votes.forEach((vote) => {
              const elem = document.getElementById(
                proposal.proposalId + "-" + vote.type
              ) as HTMLInputElement;

              if (elem?.checked) {
                voteResult.vote = vote.type;
                return;
              }
            });
            return voteResult;
          });

          // first we need to make sure the user delegates their token to vote
          try {
            //we'll check if the wallet still needs to delegate their tokens before they can vote
            const delegation = await token?.getDelegationOf(address!);
            // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
            if (delegation === AddressZero) {
              //if they haven't delegated their tokens yet, we'll have them delegate them before voting
              await token?.delegateTo(address!);
            }
            // then we need to vote on the proposals
            try {
              await Promise.all(
                votes.map(async ({ proposalId, vote: _vote }) => {
                  // before voting we first need to check whether the proposal is open for voting
                  // we first need to get the latest state of the proposal
                  const proposal = await vote?.get(proposalId);
                  // then we check if the proposal is open for voting (state === 1 means it is open)
                  if (proposal!.state === 1) {
                    // if it is open for voting, we'll vote on it
                    return vote?.vote(proposalId.toString(), _vote);
                  }
                  // if the proposal is not open for voting we just return nothing, letting us continue
                  return;
                })
              );
              try {
                // if any of the propsals are ready to be executed we'll need to execute them
                // a proposal is ready to be executed if it is in state 4
                await Promise.all(
                  votes.map(async ({ proposalId }) => {
                    // we'll first get the latest state of the proposal again, since we may have just voted before
                    const proposal = await vote?.get(proposalId);

                    //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                    if (proposal!.state === 4) {
                      return vote?.execute(proposalId.toString());
                    }
                  })
                );
                // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                setHasVoted(true);
                // and log out a success message
                console.log("successfully voted");
              } catch (err) {
                console.error("failed to execute votes", err);
              }
            } catch (err) {
              console.error("failed to vote", err);
            }
          } catch (err) {
            console.error("failed to delegate tokens");
          } finally {
            // in *either* case we need to set the isVoting state to false to enable the button again
            setIsVoting(false);
          }
        }}
      >
        {proposals.map((proposal) => (
          <div
            key={proposal.proposalId.toString()}
            className="bg-slate-200 p-4 rounded-lg shadow-lg shadow-slate-300 my-4 mx-auto"
          >
            <h5 className="break-words mb-8 font-medium">
              {proposal.description}
            </h5>
            <div className="flex justify-between">
              {proposal.votes.map(({ type, label }) => (
                <div key={type}>
                  <input
                    type="radio"
                    id={proposal.proposalId + "-" + type}
                    name={proposal.proposalId.toString()}
                    value={type}
                    //default the "abstain" vote to checked
                    defaultChecked={type === 2}
                  />
                  <label htmlFor={proposal.proposalId + "-" + type}>
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!hasVoted && (
          <small className="block mb-4">
            This will trigger multiple transactions that you will need to sign.
          </small>
        )}
        <button
          disabled={isVoting || hasVoted}
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-lg transition-colors duration-500 block ml-auto"
        >
          {isVoting
            ? "Voting..."
            : hasVoted
            ? "You Already Voted"
            : "Submit Votes"}
        </button>
      </form>
    </div>
  );
};
