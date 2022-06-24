import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import Wallet from './contracts/MultiSigWallet.json';


const getWeb3 = async () => {
    // Instantiate a web3 connection
    //return new Web3('HTTP://172.24.96.1:7545'); // Ganache
    if(window.ethereum) {
        // Initialize a web3 object using the window.ethereum as the RPC Provider!
        // window.ethereum is injected by metamask, that mean, metamask will be the RPC Provider
        const web3 = new Web3(window.ethereum)
        //window.ethereum.enable();
        const provider = await getProvider()
        // Explicitly request the user to connect its metamask account to the Dapp
        await provider.request({ method: 'eth_requestAccounts' })
        return web3
    } else if(window.web3) {
        // This is for old versions of metamask
        window.alert("You are using an old version of metamask, we kindly suggest you to update it to a more recent version")
        return window.web3
    }else {
        window.alert("Make sure to install metamask as a plugin in your browser to connect to the Dapp")
    }
}
    

const getProvider = async () => {
    return await detectEthereumProvider();
}

const getAccount = async () => {
    const provider = await getProvider();
    const accounts = await provider.request({ method: 'eth_accounts' });
    return accounts[0]; // Current account is stored in the 0 position of the accounts array
}

const getNetworkId = async () => {
    const provider = await getProvider();
    if(provider == window.ethereum) {
        const ethereum = window.ethereum
        return await ethereum.request({ method: 'net_version' })  // Will get the networkVersion (the number) from the window.ethereum object!
    }
    // If for some reason, the provider and the window.ethereum are not equals, return a null
    console.log("Error, the provider and the window.ethereum are not equals!")
    return null;
}

const getWalletContractInstance = async (web3) => {
    const contractABI = Wallet.abi;
    const networkId = await getNetworkId();
    const walletContractAddress = Wallet.networks[networkId].address;

    // To create an instance of a contract is required the ABI and the network Address where the contract is deployed!
    return await new web3.eth.Contract(contractABI,walletContractAddress);
}

export { getWeb3, getAccount, getWalletContractInstance };