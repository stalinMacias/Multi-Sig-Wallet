import React from 'react';
import { approveTransfer } from './store/interactions';
import { getAccount } from './utils';

function TransferList({ walletContract, transfers }) {

    const callApproveTransfer = async (transferId) => {
        const account = await getAccount();
        await approveTransfer(walletContract,transferId,account);
    }

    return (
        <div>
            <h2>Transfers</h2>
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Amount</th>
                        <th>To</th>
                        <th>approvals</th>
                        <th>sent</th>
                        <th>Approve Transfer</th>
                    </tr>   
                </thead>
                <tbody>
                    {transfers.map(transfer => (
                        <tr key={transfer.transferId}>
                            <td>{transfer.transferId}</td>
                            <td>{transfer.amount}</td>
                            <td>{transfer.to}</td>
                            <td>{transfer.approvals}</td>
                            <td>{transfer.sent ? 'yes' : 'no'}</td>
                            <td><button onClick={() =>callApproveTransfer(transfer.transferId)}>Approve Transfer</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TransferList;