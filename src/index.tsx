import React from "react";
import { createRoot } from "react-dom/client";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
