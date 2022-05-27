const ethers = require("ethers");
const config = require("./utils/chain_infos.json");
require("dotenv").config();
//Add as many as you wish to have configured
const pKeys = [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY_2, /* PRIVATE_KEY_3, etc... */];

//These are global variables to not pass them around too much
//They won't be changed after they are set from the input
var rpc = null;
const signers = [];
var provider = null;
var chain = null;
var exchange = null;
var abi = null;
var contractAddress = null;
var ethQuantity = null;
var contractToBuy = null;
var gasOverrides = false;
var gasValue = null;
var numberOfAccounts = null;

// CHANGE HERE THE GAS INCREMENT 
var gasToAddTimesGwei = /*This value -> */ 5 /* <- This value */  * 1000000000;
var addedGas = ethers.BigNumber.from(gasToAddTimesGwei.toString());
// CHANGE HERE THE GAS INCREMENT

async function main () {
    console.log(process.env)
    console.log("--------------------------------------------");
    chainConfiguration();
    console.log("--------------------------------------------");
    exchangeConfiguration();
    console.log("--------------------------------------------");
    checkQuantityAndContract();
    console.log("--------------------------------------------");

    console.log("Setting up the contract with these values: ");
    console.log("-Router address: " + contractAddress);
    //console.log("-Signer: " + signer.address);
    const uniV2TypeContract = new ethers.Contract(contractAddress, abi, signers[0]);
    console.log("--------------------------------------------");
    //console.log("Sending buy txn...");
    //need to change the values inside, now they are static
    console.log("Standard uniswap router? "+ config[chain].Exchanges[exchange].standard);
    if(config[chain].Exchanges[exchange].standard){
        standardUniBuy(provider, signers, uniV2TypeContract);
    }else{
        //Add here diffrent cases
        //Check the chain and the exchange to be sure
        if(exchange.toUpperCase() == "TJ"){
            traderJoeBuy(provider, signers, uniV2TypeContract);
        } 
        //more can be added, uniV3 etc
    }
}//End of main function

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
        if(pKeys !== undefined){
            pKeys.forEach(element => {
                //Setting up the signers array with private key and the provider
                let temp = signers.push(new ethers.Wallet(element, provider));
                console.log("Configured account: " + temp + " on network: " + chain);
            });
        }else{
            console.log("Private key missing, make sure you setup .env correctly ");
            process.exit(1);
        }
    }
} //End of chain configuration function

async function exchangeConfiguration () {
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
    if(process.argv[4] && process.argv[5] && process.argv[6]){
        console.log("Quantity to buy: " + process.argv[4]);
        ethQuantity = process.argv[4];
        console.log("Contract to buy: " + process.argv[5]);
        contractToBuy = process.argv[5];
        console.log("Number of accounts to buy with: " + process.argv[6]);
        numberOfAccounts = process.argv[6];
    }else{
        console.log("Quantity or contract address fiels missing, exiting...");
        process.exit(1);
    }
    //Check if the gas field is present
    if(process.argv[7]){
        gasValue = process.argv[7];
        console.log("Gas overrides with value " + gasValue);
        gasOverrides = true;
    }
}//End of checkQuantityAndContract function

const standardUniBuy = async (provider, signers, uniV2TypeContract) => {
    try{
        //Get the gas estimate from the rpc
        //Returns a bignumber
        let gasEstimate = await provider.getGasPrice()
        console.log("gas estimate... " + gasEstimate);
        console.log("Gas to add... " + addedGas);
        //Adding gas to the estimate gas
        gasEstimateGwei = gasEstimate.add(addedGas);
        console.log(gasEstimateGwei);

        //override is basically used to add (override) gas settings, value, ect..
        let overrides = {
            value: ethers.utils.parseEther(ethQuantity),
            // If gasOverrides is true it will use the input value set by the user
            gasPrice: gasOverrides ? ethers.utils.parseUnits(gasValue, "gwei") : gasEstimateGwei,
            gasLimit: 500000
        }
        
        let counter = 0;
        // foreach signer we send a buy transaction
        signers.forEach(element => {
            if(counter < numberOfAccounts){
                try{
                    uniV2TypeContract.connect(element).swapExactETHForTokens(
                        1,
                        [config[chain].WETH, contractToBuy],
                        element.address,
                        1000000000000,
                        overrides
                    );
                }catch(e){
                    console.log("Error occurred with signer " + element.address )
                }
            }
            counter++;
        });
        
        //Need to implement transaction recipt outcome
        console.log("Our call worked, call response ");
    }catch(e){
        console.log(e);
    }
}//End of standardUniBuy

async function traderJoeBuy(provider, signers, uniV2TypeContract){
    try{
        //Get the gas estimate from the rpc
        //Returns a bignumber
        let gasEstimate = await provider.getGasPrice()
        //Questo ritorna una stringa e funziona
        gasEstimateGwei = gasEstimate.add(addedGas);
        console.log(gasEstimateGwei);

        //override is basically used to add (override) gas settings, value, ect..
        let overrides = {
            value: ethers.utils.parseEther(ethQuantity),
            gasPrice: gasOverrides ? ethers.utils.parseUnits(gasValue, "gwei") : gasEstimateGwei,
            gasLimit: 500000
        }

        let counter = 0;
        // foreach signer we send a buy transaction
        signers.forEach(element => {
            if(counter < numberOfAccounts){
                try{
                    uniV2TypeContract.connect(element).swapExactAVAXForTokens(
                        1,
                        [config[chain].WETH, contractToBuy],
                        element.address,
                        1000000000000,
                        overrides
                    );
                }catch(e){
                    console.log("Error occurred with signer " + element.address )
                }
            }
            counter++;
        });

        console.log("Our call worked, call response ");
    }catch(e){
        console.log(e);
    }
}//End of traderJoeBuy

main();