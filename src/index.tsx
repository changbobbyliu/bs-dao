import React from "react";
import { createRoot } from "react-dom/client";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";

import App from "./App";
import "./index.css";

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Rinkeby;

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <ThirdwebProvider desiredChainId={activeChainId}>
    <App />
  </ThirdwebProvider>
);
