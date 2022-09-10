import {
  useAddress,
  useEditionDrop,
  useMetamask,
  useToken,
  useVote,
} from "@thirdweb-dev/react";
import { Proposal, TokenHolderBalance } from "@thirdweb-dev/sdk";
import { FC, useEffect, useState, useMemo } from "react";
import { ActiveProposalList } from "./components/ActiveProposalList.component";
import { Mascot } from "./components/Mascot.component";

export default function App() {
  // return <ConnectWallet accentColor="#f213a4" colorMode="light" />;

  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const editionDrop = useEditionDrop(
    process.env.REACT_APP_POLKADAO_CONTRACT_ADDRESS
  );
  const token = useToken(process.env.REACT_APP_PKD_ADDRESS);
  const vote = useVote(process.env.REACT_APP_GOV_ADDRESS);

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [memberTokenAmounts, setMemberTokenAmounts] = useState<
    TokenHolderBalance[]
  >([]);
  const [memberAddresses, setMemberAddresses] = useState<string[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      // We're checking if we are finding the address in the memberTokenAmounts array.
      // If we are, we'll return the amount of token the user has.
      // Otherwise, return 0.
      const member = memberTokenAmounts?.find(
        ({ holder }) => holder === address
      );

      return {
        address,
        tokenAmount: member?.balance.displayValue || "0",
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  useEffect(() => {
    if (!address || !editionDrop) return;
    (async () => {
      const balance = await editionDrop.balanceOf(address, 0); // user own NFT id 0?
      if (balance.gt(0)) {
        setHasClaimedNFT(true);
        console.log("🌟 this user has a membership NFT!");
      } else {
        setHasClaimedNFT(false);
        console.log("😭 this user doesn't have a membership NFT.");
      }
    })().catch((error) => {
      setHasClaimedNFT(false);
      console.error("Failed to get balance", error);
    });
  }, [address, editionDrop]);

  // This useEffect grabs all the addresses of our members holding our NFT.
  useEffect(() => {
    if (!hasClaimedNFT || !editionDrop) {
      return;
    }

    // Just like we did in the 7-airdrop-token.js file! Grab the users who hold our NFT
    // with tokenId 0.
    const getAllAddresses = async () => {
      try {
        const memberAddresses =
          await editionDrop.history.getAllClaimerAddresses(0);
        setMemberAddresses(memberAddresses);
        console.log("🚀 Members addresses", memberAddresses);
      } catch (error) {
        console.error("failed to get member list", error);
      }
    };
    getAllAddresses();
  }, [hasClaimedNFT, editionDrop, editionDrop?.history]);

  // This useEffect grabs the # of token each member holds.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllBalances = async () => {
      if (!token) return;
      try {
        const amounts = await token.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
        console.log("👜 Amounts", amounts);
      } catch (error) {
        console.error("failed to get member balances", error);
      }
    };
    getAllBalances();
  }, [hasClaimedNFT, token, token?.history]);

  // Retrieve all our existing proposals from the contract.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // A simple call to vote.getAll() to grab the proposals.
    const getAllProposals = async () => {
      try {
        const proposals = await vote?.getAll();
        setProposals(proposals || []);
        console.log("🌈 Proposals:", proposals);
      } catch (error) {
        console.log("failed to get proposals", error);
      }
    };
    getAllProposals();
  }, [hasClaimedNFT, vote]);

  // We also need to check if the user already voted.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // If we haven't finished retrieving the proposals from the useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }

    const checkIfUserHasVoted = async () => {
      if (!address || !vote || proposals.length === 0) return;
      try {
        const proposalIdStr = proposals[0].proposalId.toString();
        console.log("= = => Proposal ID:", proposalIdStr);
        const hasVoted = await vote?.hasVoted(proposalIdStr, address);
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log("🥵 User has already voted");
        } else {
          console.log("🙂 User has not voted yet");
        }
      } catch (error) {
        console.error("Failed to check if wallet has voted", error);
      }
    };
    checkIfUserHasVoted();
  }, [hasClaimedNFT, proposals, address, vote]);

  const mintNft = async () => {
    console.log("🔥 minting NFT for address...");
    try {
      setIsClaiming(true);
      await editionDrop?.claim("0", 1);
      console.log(
        `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop?.getAddress()}/0`
      );
      setHasClaimedNFT(true);
    } catch (error) {
      setHasClaimedNFT(false);
      console.error("Failed to mint NFT", error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-slate-100">
        <header className="container mx-auto p-2 flex justify-between items-center border-b-2">
          <h1 className="text-xl font-semibold uppercase text-cyan-700">
            💠 PolkaDAO
          </h1>
          <button
            onClick={connectWithMetamask}
            className="bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-lg transition-colors duration-500"
          >
            Connect Wallet
          </button>
        </header>
        <main className="container mx-auto p-2">
          Welcome welcome welcome 👋🏻! Please connect your wallet to get started.
        </main>
      </div>
    );
  }

  if (hasClaimedNFT) {
    return (
      <div className="flex flex-col items-center p-4 bg-slate-100 min-h-screen">
        <h1 className="text-xl font-semibold uppercase text-cyan-700">
          🍪 DAO Member Page
        </h1>
        <p className="mt-4">Congratulations on being a member</p>
        <Mascot />

        <div className="mt-4">
          <h2 className="text-center font-bold p-2 text-cyan-700 uppercase">
            Member List
          </h2>
          <div className="bg-slate-200 p-4 rounded-lg shadow-lg shadow-slate-300">
            <table className="table-fixed w-full">
              <thead>
                <tr>
                  <th>Address</th>
                  <th className="w-2/3">Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td className="text-center w-2/3">
                        {member.tokenAmount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <ActiveProposalList
          isVoting={isVoting}
          hasVoted={hasVoted}
          setIsVoting={setIsVoting}
          setHasVoted={setHasVoted}
          proposals={proposals}
        />
      </div>
    );
  }

  return (
    <div>
      <MintNFTButton disabled={isClaiming} handleOnClick={mintNft} />
    </div>
  );
}

const MintNFTButton: FC<{ disabled: boolean; handleOnClick: () => void }> = ({
  disabled,
  handleOnClick,
}) => {
  return (
    <button
      className="border-2 border-cyan-600 hover:border-cyan-500 text-cyan-600 hover:text-cyan-500 p-2 rounded-lg transition-colors duration-500 block mx-auto my-2"
      disabled={disabled}
      onClick={handleOnClick}
    >
      Mint NFT
    </button>
  );
};

const shortenAddress = (str: string) => {
  return str.substring(0, 6) + "..." + str.substring(str.length - 4);
};
