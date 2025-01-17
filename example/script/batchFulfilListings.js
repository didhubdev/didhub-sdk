import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
// const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

const provider = new ethers.providers.JsonRpcBatchProvider(process.env.BSC_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

const secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";

// input params =================================================================
const orderIds = ["OPENSEA:0xace3b58bb1b084cd58b3a6b15041a066d62ef574a9715e3e56dd54ea20d10d48"];
const margin = 3; // 3%
// const paymentToken = ZERO_ADDRESS;
const paymentToken = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
// =============================================================================

// instantiate SDK
const sdk = new DIDhubSDK(signer, secret);

const advancedOrders = await sdk.opensea.getAdvancedListingOrders(orderIds);

console.log("Fetching Swap Info...");
const swapInfo = await sdk.opensea.getSwapInfo(advancedOrders, paymentToken, margin);

// approval needed if the paymentToken is not native token
if (paymentToken !== ZERO_ADDRESS) {    
    // check and approve
    console.log('Checking Approval');
    const approveTx = await sdk.opensea.approveERC20Tokens(paymentToken, swapInfo.paymentMax);
    if (approveTx) await approveTx.wait();
    console.log(`Approved ERC20 Tokens`);
}

const tx = await sdk.opensea.fulfillListings(advancedOrders, swapInfo);
const receipt = await tx.wait();
console.log("PUrchase Completed");
