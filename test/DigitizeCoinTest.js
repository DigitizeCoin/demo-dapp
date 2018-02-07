const DigitizeCoin = artifacts.require("./DigitizeCoin.sol");
var BigNumber = require('bignumber.js');

let owner;
let user1;
let totalSupply = new BigNumber("200000000000000000000000000");
let oneToken = 1000000000000000000;

contract('DigitizeCoin', (accounts) => {

    before(async () => {
        owner = accounts[0];
        user1 = accounts[1];
    });

    it("Fresh contract has correct initial values", async () => {
        let contract = await DigitizeCoin.new();

        assert("Digitize Coin" == await contract.name.call());
        assert("DTZ" == await contract.symbol.call());
        assert(!(await contract.transferable.call()));
        console.log(totalSupply);
        console.log(await contract.totalSupply.call());

//        assert(totalSupply.isEqualTo(await contract.totalSupply.call()).toNumber());
    });

    it("Can transfer tokens to any address when allowed", async () => {
        let contract = await DigitizeCoin.new();

        await contract.enableTransfers();
		assert(await contract.transferable.call());

        let tokenBalanceUserBefore = await contract.balanceOf.call(user1);
        await contract.transfer(user1, oneToken, {from: owner});        
        let tokenBalanceUserAfter = await contract.balanceOf.call(user1);
        console.log(tokenBalanceUserBefore.toNumber());
        console.log(tokenBalanceUserAfter.toNumber()/1000000000000000000);
        // assert(tokenBalanceUserBefore + oneToken == tokenBalanceUserAfter);
    });

});