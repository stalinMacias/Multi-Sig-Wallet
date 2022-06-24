const { expectRevert } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const Wallet = artifacts.require('MultiSigWallet');

contract('MultiSigWallet', (accounts) => { 
    let wallet;
    let approvers; 
    beforeEach(async () => {
        // Define what accounts will be the approvers! 
        approvers = [accounts[0],accounts[1],accounts[2]];

        // Initialize the contract 
        wallet = await Wallet.new(approvers);

        // Send some Ether to the contract from the account[0]
        await web3.eth.sendTransaction({ from: accounts[0] , to: wallet.address, value: 10000});
    }); 

    // First test
    it('Validating the list of approvers and the value of the quorum after the contract has been created', async () => {
        // get the list of approvers
        const contractApprovers = await wallet.getApprovers();
        // get the quorum
        const quorum = await wallet.quorum();
        
        assert(approvers.length === contractApprovers.length);
        assert(approvers[0] === contractApprovers[0]);
        assert(approvers[1] === contractApprovers[1]);
        assert(approvers[2] === contractApprovers[2]);
        assert(quorum.toNumber() === contractApprovers.length);
    });

    // Testing createTransaction()
    it('Testing the createTransaction() using an approved account', async () => {
        // The account[0] which is stored in approvers[0] will create a transaction to send 1000 to the account[5]
        let response = await wallet.createTransfer(1000,accounts[5], { from: approvers[0] });
        //console.log(response);

        const transfer0 = await wallet.getTransfers();
        assert(transfer0[0].transferId.toString() == '0');
        assert(transfer0[0].to == accounts[5]);
        assert(transfer0[0].amount.toString() == '1000');
        assert(transfer0[0].approvals.toString() == '0');
        assert(transfer0[0].sent == false);
    });

    it('Testing for error when an unauthorized user tries to create a transaction', async () => {
        // An unauthorized user tries to create a transaction, the modifier onlyOwner() must generate the error: 'Only approvers can call this function'
        await expectRevert(
            wallet.createTransfer(1000,accounts[2], { from: accounts[5] }),
            'Only approvers can call this function'
        );
    });

    // Testing approveFunction()
    it('If we add an approval to the transfer but the quorum has not been reached', async () => {
        // Creating a transaction for this test
        await wallet.createTransfer(1000,accounts[5], { from: approvers[0] });

        let transfers = await wallet.getTransfers();
        const transferBeforeApproving = transfers[0]
        const transferId = transferBeforeApproving.transferId;
        const approvalBeforeApproving = Number(transferBeforeApproving.approvals);

        // Call the approveFunction() as the approvers[0]
        await wallet.approveTransfer(transferId, { from : approvers[0] });

        transfers = await wallet.getTransfers();
        const transferAfterApproving = transfers[0];
        const approvalAfterApproving = transferAfterApproving.approvals;
        const sentAfterApproving = transferAfterApproving.sent;

        // Validate that the approvals increased only 1
        assert(approvalAfterApproving - 1 == approvalBeforeApproving, "Approval was not increased by 1");

        // Because this is the first approval, we can valiate that the approval parameter is set to 1
        assert(approvalAfterApproving == 1, "Approval is not equals to 1");

        // Validate that the parameter sent of the transfer is still set to false
        assert(sentAfterApproving == false, "The sent parameter is not set to false");
    })

    it('If enough approvers approve the transfer and the quorum is finally reached', async () => {
        // Creating a transaction for this test
        await wallet.createTransfer(1000,accounts[5], { from: approvers[0] });

        // Get the quroum
        const qourum = await wallet.quorum();

        // Get the contract's balance before sending the Transfer
        const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(wallet.address));

        // all approvers will approve the transaction         
        let transfers = await wallet.getTransfers();
        const transferId = transfers[0].transferId;

        // Call the approveFunction() as the approvers[0]
        await wallet.approveTransfer(transferId, { from : approvers[0] });
        // Call the approveFunction() as the approvers[1]
        await wallet.approveTransfer(transferId, { from : approvers[1] });
        // Call the approveFunction() as the approvers[2]
        await wallet.approveTransfer(transferId, { from : approvers[2] });

        transfers = await wallet.getTransfers();
        const transferAfterAllApproved = transfers[0]
        const approvalAfterAllApproved = Number(transferAfterAllApproved.approvals);
        const sentAfterAllApproved = transferAfterAllApproved.sent;

        assert(approvalAfterAllApproved == qourum.toNumber(), "Approvals are not the same as the quorum")
        assert(sentAfterAllApproved == true, "Sent parameter is not set to true, even though the approvals finally reached the quorum");

        // Validate if the correct amount of Ethers were sent - Check the balance before and after and compare the difference!
       
        // Get the contract's balance after sending the Transfer
        const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(wallet.address));
        //console.log("the contract';s balance is returned as: ", typeof(await web3.eth.getBalance(wallet.address)));


        const amountSent = Number(transfers[0].amount);
        //console.log("Data type of an uint defined in a struct when is retrieved in JS: ", typeof(transfers[0].amount))

        //console.log("TYpe of the sub:" , typeof(balanceBefore.sub(balanceAfter).toNumber()), (balanceBefore.sub(balanceAfter).toNumber()))
        //console.log("Amountset:L ", typeof(amountSent) , amountSent)
        assert(balanceBefore.sub(balanceAfter).toNumber() ==  amountSent, "There is an error in the contract's balance");

    })

    it("call the approveTransfer() function as an non-approver account", async () => {
        // Creating a transaction for this test
        await wallet.createTransfer(1000,accounts[5], { from: approvers[0] });
        const transferId = 0;

        await expectRevert(
            wallet.approveTransfer(transferId, { from : accounts[5] }),
            "Only approvers can call this function"
        )
    });

    it("Try to approve a transfer that was already sent before", async () => {
        // Creating a transaction for this test
        await wallet.createTransfer(1000,accounts[5], { from: approvers[0] });
        const transferId = 0;
        
        // All approvers approve the transfer
        await wallet.approveTransfer(transferId, { from : approvers[0] });
        await wallet.approveTransfer(transferId, { from : approvers[1] });
        await wallet.approveTransfer(transferId, { from : approvers[2] });

        const transfers = await wallet.getTransfers();
        const transferAfterSent = transfers[0];
        const wasSent = transferAfterSent.sent;
        // Validate that the transfer was sent, if not, stop the test!
        assert(wasSent == true, "The transfer has not been sent yet");

        // Try to approver the transfer that was already sent!
        await expectRevert(
            wallet.approveTransfer(transferId, { from : approvers[2] }),
            "This transfer has already been sent"
        );
    });

    it.only("Call the approveTransfer() as an account that already approve the transfer", async () => {
        // Creating a transaction for this test
        await wallet.createTransfer(1000,accounts[5], { from: approvers[0] });
        const transferId = 0;
        
        // Approve the transfer as approvers[0]
        await wallet.approveTransfer(transferId, { from : approvers[0] });

        // Try to pprove the transfer again as approvers[0
        await expectRevert(
            wallet.approveTransfer(transferId, { from : approvers[0] }),
            "The same user can't approve the transfer twice"
        );
    });

    

});
