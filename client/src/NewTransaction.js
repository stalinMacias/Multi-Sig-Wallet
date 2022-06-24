import React, {useState} from 'react';
import { createTransfer } from './store/interactions.js';
import { getAccount} from './utils.js';


function NewTransaction ({walletContract}) {
    const [transfer,setTransfer] = useState(undefined);
    
    const submit = async (e) => {
        e.preventDefault();
        const account = await getAccount();
        console.log("Wallet Contract in the NewTransaction component:" , walletContract)
        createTransfer(walletContract,transfer,account);    
    }

    const updateTransfer = (e,field) => {
        const value = e.target.value;
        setTransfer({ ...transfer, [field] : value });
    }

    return (
        <div>
            <h2> Create Transfer</h2>    
            <form onSubmit={(e) => submit(e) }>
                <label htmlFor="amount">Amount</label>
                <input
                    id="amount"
                    type="text"
                    onChange={e => updateTransfer(e, 'amount') }    
                />
                <label htmlFor="to">To</label>
                <input
                    id="to" 
                    type="text"
                    onChange={e => updateTransfer(e, 'to') }    
                />
                <button>Submit</button>
            </form>
        </div>
    )
}

export default NewTransaction;