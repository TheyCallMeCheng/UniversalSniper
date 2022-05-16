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
var ethQuantity = null;
var contractToBuy = null;

// Gas increment from the base gas fee -- !not working
var addedGas = ethers.utils.formatUnits(10000, "gwei");


async function main () {
    console.log("--------------------------------------------");
    chainConfiguration();
    console.log("--------------------------------------------");
    exchangeConfiguration();
    console.log("--------------------------------------------");
    checkQuantityAndContract();
    console.log("--------------------------------------------");

    console.log("Setting up the contract with these values: ");
    console.log("-Router address: " + contractAddress);
    console.log("-Signer: " + signer.address);
    const uniV2TypeContract = new ethers.Contract(contractAddress, abi, signer);
    console.log("--------------------------------------------");
    //console.log("Sending buy txn...");
    //need to change the values inside, now they are static
    classicUniBuy(provider, signer, uniV2TypeContract);
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
        let abiLocation = config[chain].Exchanges[exchange].abi;
        console.log("Abi location: " + abiLocation);
        abi = require(abiLocation);
        //Assign the contract address to a local variable
        contractAddress = config[chain].Exchanges[exchange].contract;

    }
}//End of exchange configuration

async function checkQuantityAndContract(){
    if(process.argv[4] && process.argv[5]){
        console.log("Quantity to buy: " + process.argv[4]);
        ethQuantity = process.argv[4];
        console.log("Contract to buy: " + process.argv[5]);
        contractToBuy = process.argv[5];
    }else{
        console.log("Quantity or contract address fiels missing, exiting...");
        process.exit(1);
    }
}

const classicUniBuy = async (provider, signer, uniV2TypeContract) => {
    try{
        //Get the gas estimate from the rpc
        //Questo ritorna un bignumber
        let gasEstimate = await provider.getGasPrice()
        //Questo ritorna una stringa e funziona
        gasEstimateGwei = ethers.utils.parseUnits("2.0", "gwei");
        console.log(gasEstimateGwei);

        //override is basically used to add (override) gas settings, value, ect..
        let overrides = {
            value: ethers.utils.parseEther(ethQuantity),
            gasPrice: gasEstimateGwei,
            gasLimit: 500000
        }

        //sends the transaction
        responseTxn = await uniV2TypeContract.swapExactETHForTokens(
            1,
            [config[chain].WETH, contractToBuy],
            signer.address,
            1000000000000,
            overrides
        );
        await responseTxn.wait();

        console.log("Our call worked, call response ", responseTxn);
    }catch(e){
        console.log(e);
    }
}

//Stopping the buy while I'm testing
//classicUniBuy(provider, signer, uniV2TypeContract);


main();