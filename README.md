# Blockchain 
Code targeted on blockchain implementation in JavaScript <br/>
<b>Consensus:</b> PoW/PoS with longest chain <br/>
<b>Hash:</b> SHA256 <br/>
<b> Nodes: </b> Variable <br/>
<b>Block Size: </b> Variable (Default: 5)

## Pre-requisites:
1. Nodejs (Used: v16.15.1)
2. NPM (Used: v8.11.0)
3. POSTMAN to interact with API (2022 June)
4. Required modules/libraries
    - Express (Used: v4.18.1)
    - Nodemon (Used: v1.19.4)
    - Body-parser (Used: v1.20.0)
    - Request-promise (Used: v4.2.6)(Deprecated)
    - SHA256 (Used: v0.2.0)
    - UUID (Used: v3.4.0)

## Functions
1. (GET) View Existing Blockchain http://localhost:3001/blockchain
2. (POST) Create Transaction broadcast http://localhost:3001/transaction/broadcast
3. (POST) Create Multiple Transactions broadcast http://localhost:3001/multiple-txn
4. (POST) Register and Broadcast Nodes http://localhost:3001/register-and-broadcast-node
5. (GET) Mine blocks broadcast using PoW http://localhost:3001/mine
6. (POST) Mine blocks broadcast using PoS http://localhost:3001/mine-pos
7. (POST) Mine blocks in all LBCs using PoS http://localhost:3001/multi-mine
8. (GET) Invoke Consensus and Blockchain Sync http://localhost:3001/consensus
9. (GET) View Global blockchain http://localhost:3009/bridge


This repo contains all iterations for personal convenience. The latest release and step-by-step documentation to use the code and reproduce results is available [here](https://link-url-here.org) . Please keep in mind that this code is only for simulation of the hierarchical model and performance testing, hence does not implement several features that commercial blockchains do.

### Note:
- Remember to set TRANSACTION_THRESHOLD in both files to alter block size.<br/>
- Change node count by opening the API on different ports. Check package.json to define additional nodes. Remember to declare these in the network during register-and-broadcast-node
- When running /mine-pos endpoint remember to input number of nodes. Mandatory for working of PoS.
- This code does not implement wallets (PKI/signing), ICO and validator lists.
