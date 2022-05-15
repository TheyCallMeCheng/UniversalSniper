const ethers = require("ethers");
const abi = require("./utils/abis/uni_abi.json");
require("dotenv").config();

const url = "https://eth-rinkeby.alchemyapi.io/v2/qqRGZbmWFrq-JdCqYI2avk1tMjtkZ_Dv";
const contractAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const contractABI = abi;
const pKey = process.env.PRIVATE_KEY;
let signer = null;
let provider = null;

//just making sure the .env file is setup correctly
if(pKey !== undefined){ 
    //Setting up the rpc provider (infura, quicknode, etc...)
    provider = new ethers.providers.JsonRpcProvider(url);
    //Setting up the signer with private key and the provider
    signer = new ethers.Wallet(pKey, provider);
    console.log(signer)
}else{
    console.log("Private key missing, make sure you setup .env correctly ");
    process.exit(1);
}

const uniV2TypeContract = new ethers.Contract(contractAddress, contractABI, signer);
//console.log(uniV2TypeContract);

const buyDai = async (provider, signer, uniV2TypeContract) => {
    try{
        //override is basically used to add (override) gas settings, value, ect..
        let overrides = {
            value: ethers.utils.parseEther("0.01"),
            gasPrice: ethers.utils.parseEther("0.0000000123")
        }
        //sends the transaction
        responseTxn = await uniV2TypeContract.swapExactETHForTokens(
            1,
            ["0xc778417E063141139Fce010982780140Aa0cD5Ab", "0xE6dfa2B48d9ACe62Ff4fe6c1ce0F2c7034886023"],
            "0x62791F0853Bba37983a4004ca9562f45c0df1210",
            1000000000000,
            overrides
        );
        await responseTxn.wait();

        console.log("our call worked, call response ", responseTxn);
    }catch(e){
        console.log(e);
    }
}


buyDai(provider, signer, uniV2TypeContract);