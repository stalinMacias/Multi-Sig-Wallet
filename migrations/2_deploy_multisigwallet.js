const MultiSigWallet = artifacts.require("MultiSigWallet");

module.exports = async function (deployer, _network, accounts) {
    // Deploy the contract to the blockchain
    console.log(accounts)
    await deployer.deploy(MultiSigWallet, [accounts[0],accounts[1],accounts[2]]);
    const wallet = await MultiSigWallet.deployed();
    // Deposit Ether from account 1 to this contract
    await web3.eth.sendTransaction({ from : accounts[0], to : wallet.address, value : 10000});
}