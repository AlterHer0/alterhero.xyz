import React from "react"
import "./mintPopUpInfo.module.css"
import { useEffect, useState } from 'react';

// Ethers tools
//import contract from '../contracts/ARCHIVES.json';

import mintToken from '../asset/mintheroz.png'
import moins from '../asset/moins.png'
import plus from '../asset/plus.png'
import mintbackSrc from '../asset/prezPaper.png'

/* PopUp message management */
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

/* ether management */  
import { BrowserProvider } from "ethers";
const ethers = require("ethers");

const contractAddress = "0x102bAd61dA373043e56238285db33C913F5409C9";
const abi = contract.abi;
const priceNft = 0.001;

/* Main Function */
const MintPage = (props) => {

  
  const [isCurrentMint, setisCurrentMint] = useState(1);

  const addToken = () => {
    var tmpData = 1;
    console.log("addToken");
    if(isCurrentMint < 7)
    {
      tmpData = isCurrentMint+1
      setisCurrentMint(tmpData)
      console.log("isCurrentMint", isCurrentMint);
    }
  }
  const remToken = () => {
    var tmpData = 1;
    console.log("remToken");
    if(isCurrentMint !== 1)
    {
      tmpData = isCurrentMint-1
      setisCurrentMint(tmpData)
      console.log("isCurrentMint", isCurrentMint);
    }
  }

  const mintNftHandler = async () => {
    const { ethereum } = window;   
  
    if (!ethereum) {
      alert("Please install Metamask!");
    }
  
    try {      
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account to mint: ", account);
          //const provider = new ethers.providers.Web3Provider(window.ethereum)
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const nftContract = new ethers.Contract(contractAddress, abi, signer);
  
          const balance = await provider.getBalance(account.toString())
          console.log("balance : ",balance.toString());
          const balanceEth = balance.toString()
          //console.log("balanceEth : ",ethers.formatEther(balance);
          console.log("isCurrentMint", isCurrentMint);
          const payM = isCurrentMint*priceNft;
          console.log("PayM information : ", payM);
          alert("Mining is lauching");
          let nftTxn = nftContract.PublicMint(isCurrentMint, { value: ethers.parseEther(payM.toString())});
          console.log("Data info return",nftTxn);
  
          /* Open PopUp to informe user of the minting process */
          alert("Mining... please wait");
          console.log(`Mining, see transaction: https://sepolia.etherscan.io/tx/${nftTxn.hash}`);
          await nftTxn.wait();
  
          /* Data for mining information */
          //console.log(`Mining, see transaction: https://sepolia.etherscan.io/tx/${nftTxn.hash}`);
          console.log(`Mined, see transaction: https://sepolia.etherscan.io/tx/${nftTxn.hash}`);
        }else {
          alert("Please login before Mint!");
          console.log("No connected wallet found!")
        }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="MintWindow">              
      <div className="MintInfo">
        <img className="mintBackImg" src={mintbackSrc} alt="mintBackground" /> 
      </div>
      <div className="MintInfo mintAction"> 
        <img className="remTokenButt" src={moins} alt="-" onClickCapture={remToken} />
        <div className="mintNumberQt">{isCurrentMint}</div>
        <img className="addTokenButt" src={plus} alt="+" onClickCapture={addToken} />
      </div>
      <div className="MintInfo mintAction2">
      <a href="#alter"> <img className="mint-button" src={mintToken} onClickCapture={mintNftHandler} alt="Back" disabled={true}/></a>
      </div>
      <div className="MintInfo MessageBanner"> 
      <div className="MessageBannerText">Display minting process information here !!</div>
        <Popup trigger={<button> Display minting process information here !!</button>} position="right center">
          <div>Popup content here !!</div>
        </Popup>
      </div>
    </div>
  )
}

export default MintPage