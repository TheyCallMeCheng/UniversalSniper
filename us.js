const ethers = require("ethers");
//Must figure out how to get the abis
// const abi = require("./utils/abis/uni_abi.json");
const config = require("./utils/chain_infos.json");

require("dotenv").config();

// These must be pulled from config file

const pKey = process.env.PRIVATE_KEY;

//These are global variables to not pass them around too much
//They won't be changed after they are initialized
var rpc = null;
var signer = null;
var provider = null;
var chain = null;
var exchange = null;
var abi = null;
var contractAddress = null;


async function main () {
    chainConfiguration();
    exchangeConfiguration();
}

async function chainConfiguration () {
    // Check every key of the object (chain ticker) if it's equal to the selected one
    Object.keys(config).forEach(element => {
        if(process.argv[2] && (process.argv[2]).toUpperCase() == (element).toUpperCase()){
            console.log("Chain: " + element );
            chain = element;
            rpc = config[element].RPC;
        }
    });
    //If the chain is not avaible or if it's not spelled correctly the program exits 
    if(chain == null){
        console.log("The chain you selected is not avaiable or it's not spelled right");
        process.exit(1);
    }else{
        //Setting up the rpc provider (infura, quicknode, etc...)
        console.log("Setting up the account and provider...");
        try{
            //Will have to figure out a way to use the backup rpc if the first one fails
            provider = new ethers.providers.JsonRpcProvider(rpc);
            
        }catch(e){
            console.log("Some error occured while connecting to the rpc: \n" + e);
            console.log("Exiting the process, please check the rpc url in the chain_infos.json file ");
            process.exit(1);
        }
        //just making sure the .env file is setup correctly
        if(pKey !== undefined){ 
            //Setting up the signer with private key and the provider
            signer = new ethers.Wallet(pKey, provider);
            console.log("Configured account: " + signer.address + " on network: " + chain);
        }else{
            console.log("Private key missing, make sure you setup .env correctly ");
            process.exit(1);
        }
    }
} //End of chain configuration function

async function exchangeConfiguration () {
    // const abi = require();
    // const contractABI = abi;
    Object.keys(config[chain].Exchanges).forEach(element => {
        if(process.argv[3] && (process.argv[3]).toUpperCase() == (element).toUpperCase()){
            exchange = element;
        }
    });

    if(exchange == null){
        console.log("Error: Selected exchange is not avaiable or it's not spelled right");
        process.exit(1)
    }else{
        console.log("Exchange slected " + exchange);
        console.log("Setting up the exchange abi");
        abi = require(config[chain].Exchanges[exchange].abi);
        //Assign the contract address to a local variable
        contractAddress = config[chain].Exchanges[exchange].Contract;
    }
}//End of exchange configuration

// contractAddress and contract abi must be pulled from JSON file
const uniV2TypeContract = new ethers.Contract(contractAddress, abi, signer);
//console.log(uniV2TypeContract);

const classicUniBuy = async (provider, signer, uniV2TypeContract) => {
    try{
        //override is basically used to add (override) gas settings, value, ect..
        let overrides = {
            value: ethers.utils.parseEther("0.001"),
            gasPrice: ethers.utils.parseEther("0.0000000123"),
            gasLimit: 500000
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

//Stopping the buy while I'm testing
//classicUniBuy(provider, signer, uniV2TypeContract);


main();