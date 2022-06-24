# Blockchain 
Code targeted on blockchain implementation in JavaScript <br/>
Consensus: PoW with longest chain <br/>
Hash: SHA256 <br/>
Nodes: 10

## Functions
1. View Existing Blockchain http://localhost:3001/blockchain
2. Create Transaction broadcast http://localhost:3001/transaction/broadcast
3. Create Multiple Transactions broadcast http://localhost:3001/multiple-txn
4. Register and Broadcast Nodes http://localhost:3001/register-and-broadcast-node
5. Mine blocks broadcast http://localhost:3001/mine
6. Invoke Consensus and Blockchain Sync http://localhost:3001/consensus


### Note:
- Remember to set TRANSACTION_THRESHOLD in both files <br/>
- Change node count by opening the API on different ports. Check package.json to define additional nodes. Remember to declare these in the network during register-and-broadcast-node
