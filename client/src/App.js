import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { getWeb3, getAccount, getWalletContractInstance } from './utils.js';
import { getApprovers, getQuorum, getTransfers } from './store/interactions.js';

import Header from './Header.js';
import NewTransaction from './NewTransaction.js';
import TransferList from './TransferList.js';

function App() {

  // create state variables using th useState hook()
  const [web3 , setWeb3] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [walletContract, setWalletContract] = useState(undefined);
  const [approvers, setApprovers] = useState(undefined);
  const [quorum, setQuorum] = useState(undefined);
  const [transfers, setTransers] = useState([]);

  // initialize the state variables using the useEffect() hook
  useEffect( () => {
    const init = async () => {
      const web3 = await getWeb3();
      const account = await getAccount();
      const walletContract = await getWalletContractInstance(web3);
      const approvers = await getApprovers(walletContract);
      const quorum = await getQuorum(walletContract);
      const transfers = await getTransfers(walletContract);

      setAccount(account);
      setWeb3(web3);
      setWalletContract(walletContract);    
      setApprovers(approvers);
      setQuorum(quorum);
      setTransers(transfers);
    }
    init();
  }, []);

  // Validate if the state variables were succesfully initialized
  if(
    typeof web3 === 'undefined'
    || typeof walletContract === 'undefined'
    || typeof approvers === 'undefined'
    || typeof quorum === 'undefined'
    || transfers == []
    ) {
      return <div>Loading things!</div>
  } else if (typeof account === 'undefined') {
      console.log("Verify that your accounts is connected to metamask!")
      return <div>Verify that your accounts is connected to metamask!</div>
  } else {
    //console.log("web3: ",web3)
    //console.log("account: ",account)
    //console.log("walletContract in the App component: ",walletContract)
    //console.log("approvers: ",approvers)
    //console.log("quorum: ",quorum)
    //console.log("transfers from App component", transfers)
  }

    return (
    <>
      <div>
        MultiSigWallet
      </div>
      <Header approvers={approvers} quorum={quorum} />
      <NewTransaction walletContract={walletContract} />
      <TransferList walletContract={walletContract} transfers={transfers} />
    </>
    
    
  );
}

export default App;