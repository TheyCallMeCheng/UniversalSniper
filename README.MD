## UNIVERSAL SNIPER 

Work in progress...

To launch:
'' node us.js [chain] [exchange] [ethValue] [contractToBuy] [number-of-accounts] (override)[gasPriceGwei]''

To setup:
- npm install
- create .env file with the variable "PRIVATE_KEY"

Next to add:
- Find a way to ~~manage gas~~ add gas to the estimate *done*
- Check if quantity and contract to buy data is submitted, if not exit *done*
- Support for sending data inline *done*
- Put buy in a proper function and add variables instead of static values (and try) *done*
- Diffrent buy func for traderJoe *done*
- Complete JSON with chain info

--- Coming up ---
- swapETHForExactTokens function implementation
- automatic gas estimate *done*
- Maybe add colors if transaction success = Green if fails = red
- Support for uniV3

FOR TESTING PURPOSES ONLY IM BUYING THIS CONTRACT
0xE6dfa2B48d9ACe62Ff4fe6c1ce0F2c7034886023

### EXCHANGES TESTED:
- [x] Uniswap v2 Rinkeby testnet (ticker rETH)
- [x] Traderjoe on Avalanche
- [ ] Uniswap v2 Ethereum
- [ ] Sushiswap on Eth
... more to come