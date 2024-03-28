import React from "react";
import { useEffect, useState } from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import EthereumProvider from "@walletconnect/ethereum-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
//import consola from "consola";

/* PopUp management */
import CookieConsent from "react-cookie-consent";

/* React Import Div */
import { Network, Alchemy } from "alchemy-sdk";

/* Waiting Page */
import Waiting from "../components/Waiting/Waiting";
import MobilePage from "../components/MobilePage/MobilePage";
import MintSuccess from "../components/MintSuccess/MintSuccess";



const contractAddress = require("../config/contractConfig.json").contractAddress;
const abi = require("../config/test-abi.json");

const web3 = new Web3(
  "https://eth-sepolia.g.alchemy.com/v2/tZgBg81RgxE0pkpnQ6pjNpddJBd6nR_b"
);

/* Alchemy Api setting */
const settings = {
  apiKey: "-mNW_dac_YN2yENp4SMvtNfl2ZfTeYeV",
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

function App({ element }) {
  /* UseState config */
  const [walletAddress, setWalletAddress] = useState("");
  const [provider, setProvider] = useState();
  const [DisplayMobileP, setDisplayMobileP] = useState(false);
  const [buttonText, setButtonText] = useState(""); //same as creating your state variable where "Next" is the default value for buttonText and setButtonText is the setter function for your state variable instead of setState
  const [isConnected, setIsConnected] = useState(false);
  const [isCurrentMinted, setCurrentMinted] = useState("???");
  const [isMintActivated, setMintActivated] = useState(false);

  const [timeLeft, setTimeLeft] = useState(
    (1712491200 * 1000 - Date.now()) / 1000
  ); // 10 hours in seconds
  //const [price, setPrice] = useState(0)
  const [quantity, setQuantity] = useState(0);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [hasBalance, setHasBalance] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const days = Math.floor(timeLeft / (3600 * 24));
  const hours = Math.floor((timeLeft - days * 3600 * 24) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = Math.floor(timeLeft % 60);

  const hoursStr = String(hours).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");
  const secondsStr = String(seconds).padStart(2, "0");

  // Stop the countdown if timeLeft reaches zero
  useEffect(() => {
    if (timeLeft === 0) {
      clearInterval();
    }
  }, [timeLeft]);

  /* Waiting Data */
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  /* Check connectionConnection with metamasck TODO ajout multiwallet */
  const providerOptions = {
    walletconnect: {
      package: EthereumProvider, // required
      options: {
        rpc: "https://eth-mainnet.g.alchemy.com/v2/trNMW5_zO5iGvlX4OZ3SjVF-5hLNVsN5", // required
      },
    },
    coinbasewallet: {
      package: CoinbaseWalletSDK, // Required
      options: {
        appName: "Ascendant.Finance", // Required
        rpc: "https://eth-mainnet.g.alchemy.com/v2/trNMW5_zO5iGvlX4OZ3SjVF-5hLNVsN5", // Optional if `infuraId` is provided; otherwise it's required

        darkMode: true, // Optional. Use dark theme, defaults to false
      },
    },
  };

  async function connectWallet() {
    try {
      let web3Modal = new Web3Modal({
        network: "mainnet", // optional
        theme: "dark",
        cacheProvider: false,

        providerOptions,
      });
      const web3ModalInstance = await web3Modal.connect();
      const provider = new Web3(web3ModalInstance);
      if (web3ModalInstance) {
        setProvider(provider);

        const accounts = await provider.eth.getAccounts();
        const address = accounts[0];
        setWalletAddress(address);

        const balance = await checkBalance(address);
        if(balance > 0){
          setHasBalance(true)
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  /* Check display resolution mode */
  const checkDisplayedResolution = async () => {
    setLoader(true);
    var currentScreen = window.innerWidth;
    if (currentScreen < 768) {
      setDisplayMobileP(true);
    } else {
      setDisplayMobileP(false);
    }
  };

  const [isLoading, setLoader] = useState(true);

  const checkLoadingState = async () => {
    await delay(2000);
    if (document.readyState === "complete") {
      setLoader(false);
    } else {
      setLoader(true);
    }
  };

  const [mintButtClicked, setmintButtClicked] = useState(false);
  const mintActivated = () => {
    setmintButtClicked(!mintButtClicked);
  };
  

  useEffect(() => {
    //checkWalletIsConnected();
    window.addEventListener("resize", checkDisplayedResolution);
    
    checkLoadingState();
  });

  const increment = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };
  const decrement = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  const mint = async () => {
    const mintContract = await new provider.eth.Contract(abi, contractAddress);

    let total = 0.04 * 10 ** 18 * quantity;

    await mintContract.methods
      .mint(quantity)
      .send({ from: walletAddress, value: total, gas: 300000 });

      setMintSuccess(true);
      getTotalSupply();
      setHasBalance(true)
  };

  const checkBalance = async (address) => {
    const mintContract = await new web3.eth.Contract(abi, contractAddress);

    return await mintContract.methods.balanceOf(address).call();
  };

  const getTotalSupply = async () => {
    const mintContract = await new web3.eth.Contract(abi, contractAddress);

    const supply =  await mintContract.methods.totalSupply().call()
    console.log(supply)
    setTotalSupply(supply)
  }

 

   useEffect(() => {
     getTotalSupply();
    
  }, [])  

  /* Waiting website animation */
  if (DisplayMobileP) {
    return <MobilePage />;
  }
  return (
    <div>
      {isLoading && <Waiting />}
      {!isLoading && (
        <>
          {mintSuccess ? (
            <MintSuccess setMintSuccess={setMintSuccess} />
          ) : (
            <div
              className={"relative flex container bg-[url('/asset/Background_.png')] bg-cover bg-center bg-no-repeat"}
              id="mainPage"
            >
              {hasBalance && (
                <img src="/asset/TokenOwner.png" className="flex w-full m-auto -left-[4%] h-[100vh] absolute " />
              )}
              {walletAddress && (
                <div className="flex absolute w-full h-[100vh] z-20 ">
                  <img
                    src="/asset/AddOnceConnected.png"
                    className="flex"
                  />
                  <div className="flex text-md absolute tracking-widest leading-3 bottom-[3.75%] left-[62.5%] z-30 ">
                   <p>{totalSupply ? Number(totalSupply) : 0}/2222</p> 
                  </div>
                  <div className="bg-white space-x-2 px-2 leading-4 rounded flex absolute bottom-[32%] left-[49.5%] justify-between">
                    <div onClick={decrement} className="cursor-pointer z-30">
                      -
                    </div>
                    <div className="cursor-pointer">{quantity}</div>
                    <div onClick={increment} className="cursor-pointer z-30">
                      +
                    </div>
                  </div>
                  <img
                    onClick={mint}
                    src="/asset/MintButton.png"
                    className="flex h-[100vh] absolute z-20 cursor-pointer"
                  />
                </div>
              )}

              <div className="flex w-full m-auto absolute">
                {walletAddress ? (
                  <img
                    src="/asset/FloatingOnceWconnected.png"
                    className="relative"
                    alt="floating"
                  />
                ) : (
                  <img
                    src="/asset/Floating.png"
                    className="flex w-full m-auto "
                    alt="floating"
                  />
                )}
              </div>
              <div className="flex w-full mt-auto h-[100vh] space-x-4 items-end justify-end">
                <div className="flex  mb-3 items-end justify-end">
                  <a
                    href="https://twitter.com/_AlterHero"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className="flex w-[25px]"
                      src="/asset/icon-twitter.svg"
                      alt="TwitterButt"
                    />
                  </a>
                </div>
                <div className="flex  mb-2.5 items-end ">
                  <a
                    href="mailto:alterheroarchives@gmail.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className="w-[30px]"
                      src="/asset/IconMail.png"
                      alt="MailButt"
                    />
                  </a>
                </div>
                {walletAddress ? (
                  <div className="flex relative h-[200px]">
                    <img
                      src="/asset/WalletConnected.png"
                      className="relative"
                      alt="Back"
                    />
                    <p
                      onClick={() => setWalletAddress("")}
                      className="flex top-[24%] text-sm left-[31%] absolute z-20 cursor-pointer uppercase hover:text-white"
                    >
                      {String(walletAddress).substring(0, 18)}
                      {"..."}
                    </p>
                  </div>
                ) : (
                  <div className="flex relative h-[200px]">
                    <img
                      src="/asset/ConnectYourWallet.png"
                      className="flex "
                      alt="Back"
                    />
                    <p
                      onClick={connectWallet}
                      className="flex top-[24%] text-sm left-[31%] absolute z-20 cursor-pointer uppercase hover:text-white"
                    >
                      Connect Your Wallet
                    </p>
                  </div>
                )}

                <div className="flex absolute text-xl bottom-[17.5%] left-[5%]">
                  {days}:{hoursStr}:{minutesStr}:{secondsStr}
                </div>
              </div>
              {/* 
      
      <div className="Welcome CoockieBanner"> 
        <CookieConsent
        location="bottom" cookieName="CoockieBanner" expires={150} overlay
        buttonText="Got it"
        style={{ background: "#2B373B" }}
        >We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.    
        <span style={{ fontSize: "15px"}}>
          <a className="CoockieInfo" href="https://en.wikipedia.org/wiki/HTTP_cookie" target="_blank" rel="noreferrer">   More Info.</a></span>
        </CookieConsent>
      </div> */}
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default App;
