/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="react-scripts" />

namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_API_URL: string;
    REACT_APP_PRIVATE_KEY: string;
    REACT_APP_WALLET_ADDRESS: string;
    REACT_APP_ALCHEMY_API_URL: string;

    REACT_APP_POLKADAO_CONTRACT_ADDRESS: string;
    REACT_APP_PKD_ADDRESS: string;
    REACT_APP_GOV_ADDRESS: string;
  }
}

declare var cvs: HTMLCanvasElement;
