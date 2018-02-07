
DApp = {
    web3Provider: null,
    walletContract: null,
    tokenContract: null,
    currentAccount: null,
    table: null,

    // set to true to use with local blockchain
    development: false,
    //Rinkeby:
    tokenAddress: "0x214acba893d8413068e591aab0d680909deb2888",
    tokenDecimalMultiplier: null,

    //this rate will be fetched from somewhere
    rate: 0.2,

    init: function() {
        console.log("[x] Initializing DApp.");
        this.initScanner();
        this.initWeb3();
        this.initContract();
    },

    initScanner: function() {
        $('#reader').html5_qrcode(function(data){
                $("#digitize-form #ethereumAddress").val(data);
                console.log(data);
                $('#reader').addClass('hidden');
            },
            function(error){
                //show read errors 
            }, function(videoError){
                //the video stream could be opened
            }
        );
    },

    /**************************************************************************
     * Smart Contracts interaction methods.
     *************************************************************************/

    initWeb3: function() {
        // Is there is an injected web3 instance?
        if (typeof web3 !== 'undefined') {
          DApp.web3Provider = web3.currentProvider;
          console.log("Using current provider");
        } else {
          // If no injected web3 instance is detected, fallback to the TestRPC
          DApp.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
        }
        web3 = new Web3(DApp.web3Provider);
        console.log("[x] web3 object initialized.");
    },

    getTokenContract: function(){
        if(DApp.development)
            return DApp.tokenContract.deployed();
        else
            return DApp.tokenContract.at(DApp.tokenAddress);
    },

    initContract: function(){
        $.getJSON('DigitizeCoin.json', function(tokenContract){
            DApp.tokenContract = TruffleContract(tokenContract);
            DApp.tokenContract.setProvider(DApp.web3Provider);

            DApp.getTokenContract()
            .then(function(tokenInstance){
                return tokenInstance.decimals.call();
            })
            .then(function(decimals){
                DApp.tokenDecimalMultiplier = 10.0**decimals;
                console.log("Multiplier", DApp.tokenDecimalMultiplier);
            })
            console.log("[x] token contract initialized.");

            web3.eth.getAccounts(function(error, accounts) {
                if (error) {
                    console.error(error);
                } else {
                    DApp.currentAccount = accounts[0];
                    console.log("[x] Using account", DApp.currentAccount);
                    DApp.initDigitizeForm();
                    DApp.prefillDigitizeForm();
                    DApp.initBalanceForm();
             }});
        });
    },

    digitizeChange: function(walletAddress, amount){
        var valueInTokens = amount / DApp.rate * DApp.tokenDecimalMultiplier;
        console.log("digitizeChange");
        console.log(valueInTokens);
        DApp.getTokenContract()
            .then(function(tokenInstance){
                return tokenInstance.transfer(walletAddress, valueInTokens, {from: DApp.currentAccount});
            });
    },

    getBalance: function(walletAddress){
        console.log("getBalance");
        DApp.getTokenContract()
            .then(function(tokenInstance){
               return tokenInstance.balanceOf.call(walletAddress);
            })
            .then(function(balance){
                $("#balance-form #tokenBalance").val(balance / DApp.tokenDecimalMultiplier);
            });
    },

    /**************************************************************************
     * Form methods.
     *************************************************************************/
    initDigitizeForm: function(){

        $("#qr").click(function() { 
            $("#digitize-form #ethereumAddress").val("");
            $('#reader').removeClass('hidden');
        });

        $('#reader').on('click', function() {
            $('#reader').addClass('hidden');
        });

        $('#changeAmount').on('input', function() {
            if(!isNaN($(this).val())){
                $("#digitize-form #tokenAmount").val($(this).val() / DApp.rate);                
            }
        });

        $("#digitize-form").submit(function(event) {
            event.preventDefault();
            var form = $(this);
            var ethAddress = form.find("#ethereumAddress").val();
            var changeAmount = form.find("#changeAmount").val();
            var rate = form.find("#rate").val();

            DApp.digitizeChange(ethAddress, changeAmount, rate);
        });
    },

    prefillDigitizeForm: function(){
        $("#digitize-form #ethereumAddress").val(DApp.currentAccount);
        $("#digitize-form #rate").val(0.2);
        $("#digitize-form #tokenAmount").val(0.0);
        $("#digitize-form #changeAmount").val(0.0);
    },

    initBalanceForm: function(){
        $("#balance-form").submit(function(event) {
            event.preventDefault();
            var form = $(this);
            console.log($("#balance-form #address").val());
            var ethAddress = form.find("#address").val();
            DApp.getBalance(ethAddress);
        });
    },
}

$(function() {
    DApp.init();
});
