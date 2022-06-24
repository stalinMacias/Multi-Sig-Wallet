const getApprovers = async(walletContract) => {
    return await walletContract.methods.getApprovers().call();
}

const getQuorum = async(walletContract) => {
    return await walletContract.methods.quorum().call();
}

const createTransfer = async(walletContract, transfer, account) => {
    await walletContract.methods.createTransfer(transfer.amount,transfer.to).send({from: account})
    .on('transactionHash', (hash) => {
        console.log("Creating the transfer...");
    })
    .on('error', (error) => {
        console.log("Error while creating the transfer: ", error)
        if (error.code === 4001) {
            window.alert("User aborted the process to create a transfer")
        } else {
            window.alert("Error while creating the transfer")
        }
        })
    .once('receipt', (receipt) => {
        console.log("The transfer has been created succesfully", receipt)
    })
}

const getTransfers = async(walletContract) => {
    //const transfers = await walletContract.methods.getTransfers().call()
    return await walletContract.methods.getTransfers().call();

}

const approveTransfer = async(walletContract, transferId, account) => {
    await walletContract.methods.approveTransfer(transferId).send({from: account})
    .on('transactionHash', (hash) => {
        console.log("Approving the transfer...");
    })
    .on('error', (error) => {
        console.log("Error while approving the transfer: ", error)
        if (error.code === 4001) {
            window.alert("User aborted the process to approve a transfer")
        } else {
            window.alert("Error while approving the transfer")
        }
        })
    .once('receipt', (receipt) => {
        console.log("The transfer has been approved succesfully", receipt)
    })
}

export { getApprovers, getQuorum, createTransfer, getTransfers, approveTransfer };