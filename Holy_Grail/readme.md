## Final Hierarchical Blockchain
The complete code with all implemented features used for simulation (aka. the Holy Grail). 
</br></br>

#### All steps to reproduce results and run tests are given below: 
</br>
1. Go to code file location and open a terminal. Each node uses a separate terminal. </br></br>
2. Consider we are building a 2 LBC, 4-vals model. Open 8 terminals and run `npm run node_1` in the first terminal. For all subsequent terminals replace 1 with the node number. So, to start the 2nd node, run `npm run node_2` in the 2nd terminal and so on. </br>
Now, we have all 8 nodes running and we need to create a decentralized network so that the nodes can communicate between each other.</br></br>
3. To observe each node you can hit the node endpoint at `http://localhost:3001/blockchain` </br>
To do this, just enter the URL in any browser. With this you can view node_1 and the blockchain associated with it. Since it is not connected to any other nodes, it is a standalone node with no decentralization.
To view any other node replace the 1 with required node number in 3001. So, to view node 2, simply enter `http://localhost:3002/blockchain`. </br>
Since the browser displays JSON, by default the text is not parsed and is hard to read. If using Chrome, download the "JSON formatter" extention to make it more legible.</br></br>
4. To connect nodes to each other and create a network, open POSTMAN</br></br>
5. Create a new request.</br></br>
6. Select the POST method and hit the /register-and-broadcast-node endpoint for any node. To do this, type `http://localhost:3001/register-and-broadcast-node` in the space beside it.</br></br>
7. Select the "Body" tab below</br></br>
8. Select "Raw" and set type to "JSON"</br></br>
9. In the space below, we will be entering JSON text to connect to other nodes. The nodes connected are broadcasted among each other, so you don't need to connect every node to every other node. This means that, if 1 and 2 are connected, then connecting 1 to 3 will automatically connect 3 to 2. Basically, we broadcast connection to all nodes. All connections are also bidirectional, meaning connecting 1 to 2 will automatically connect 2 to 1.</br></br>
10. Enter the following JSON text below:
```
{
    "newNodeUrl": "http://localhost:3002"
}
```
11. Hit "SEND" </br>
Since we send this POST request on 3001 (node_1), we have successfully connected 3001 (node_1) and 3002 (node_2). To check, go to your browser where you typed the URL previously and refresh. You can now see `http://localhost:3002` in the network nodes section. Similarly, you can see `http://localhost:3001` when you open node_2 in the browser.
</br></br>
12. Repeat this by changing body necessary number of times until all 4 nodes are connected. So, now the browser for node_1 should show the following:
```
{
"chain": [
{
"index": 1,
"timestamp": 1658258558339,
"transactions": [],
"nonce": 100,
"hash": "0",
"previousBlockHash": "0"
}
],
"pendingTransactions": [],
"currentNodeUrl": "http://localhost:3001",
"networkNodes": [
"http://localhost:3004",
"http://localhost:3003",
"http://localhost:3002"
]
}
```
First LBC has been completed. Moving on to the next LBC.</br></br>

13. Now, Go back to POSTMAN and change the request endpoint (to the left-side of SEND button) from `http://localhost:3001/register-and-broadcast-node` to `http://localhost:3005/register-and-broadcast-node` </br>
We will now connect the remaining 4 nodes to form the second LBC.</br></br>
14. Follow the same procedure above to connect 3006, 3007, 3008 to 3005.
</br>

We now have the 2-LBC, 4-vals scenario. The LBCs are automatically connected to the GBC (Bridge Node). It is hard coded on endpoint 3009. For this, you need to run `npm run node_9` in a new terminal at the code location. To view the Global blockchain, simply enter `http://localhost:3009/bridge` in your browser. </br>
</br>
<strong>NOTE:  Making any changes to the code will cause nodemon to reset the servers and you will have to connect all the nodes again. </strong>
</br>
</br></br>

15. Now, to generate transactions there are 2 methods. You can either use the `/transaction/broadcast` endpoint which will create a single transaction or you can use the `/multiple-txns` endpoint which will create any specified number of transactions in one request.
</br>
Here, we will be using multiple transactions only. To send multiple requests on node_1, simply send request to `http://localhost:3001/multiple-txns`. The request body for it is as shown below:


```
{
    "number": 2000,
    "amount": 745,
    "sender": "h35ah3ff3tgqgssgfasd4fgb4gahagsgs3dgarfaer8n4afawh34df51bae",
    "recipient": "ba635rh4g42g2sgb2fvhfgqage3aw31g42ed6ggdfnfeqa8ygwejn4s63g5n"
}
```

Here, by hitting SEND, we generate 2000 transactions where the amount sent is 745 onwards, incrementing by 1 in each transaction. Sender and recipient signatures are specified as well. Since this code does not implement wallets, there signatures are random.
</br>
You can go back to the browser for any connected nodes (1,2,3,4) to note that changes have been reflected in all of them despite sending to only one node. This is the perfect example of a peer-to-peer network.
Here, we have send transactions to LBC-1. You can do the same for LBC-2 as well. </br></br>

Until here, all steps are always same. The mining process differs depending on the consensus mechanism used and the architecture followed. For this, you have 3 options.
- Proof-of-Work: Works only for normal blockchain models. Available on the `/mine` endpoint which sends a GET request. So, NO body required.
- Standard Proof-of-stake: Works only for normal blockchain models. Available on the `/mine-pos` endpoint which sends a POST request.
- Hierarchical Proof-of-stake: Works for hierarchical blockchain models. Available on `/multi-mine` endpoint which sends a POST request.

Both PoS mining methods are POST methods which take a JSON body specifying the number of nodes present. The body for both of them is the same, shown below:

```
{
    "nodes": 4
}
```

In standard models, simply enter the total number of nodes. In case of hierarchical models, enter the number of nodes connected to a single LBC, assuming all LBCs have the same number of nodes. So, in our example of 2-LBC, 4-vals case, each LBC is connected to 4 nodes. So, enter 4.</br>
This endpoint can be hit from any connected node in the LBC.


</br> You will be returned with the time required to complete the mining process. </br>
By running the `/multi-mine` endpoint all transactions in both LBCs are committed as blocks in their corresponding LBCs as well as copied to the GBC (bridge Node). So, each block mined is reflected in its LBC and GBC. To view the global blockchain (GBC), enter `http://localhost:3009/bridge` in your browser.
</br></br>
</br>
### Summary
This presents a short version of the above:
</br>
1. Open terminals and enter `npm run node_1`
2. Observe changes in browser at `http://localhost:3001/blockchain` and `http://localhost:3009/bridge`
3. In POSTMAN, send POST request at `/register-and-broadcast-node` endpoint with JSON body as:

```
{
    "newNodeUrl": "http://localhost:3002"
}
```
4. Send Transactions using `/multiple-txns` endpoint with JSON body as:
```
{
    "number": 2000,
    "amount": 745,
    "sender": "h35ah3ff3tgqgssgfasd4fgb4gahagsgs3dgarfaer8n4afawh34df51bae",
    "recipient": "ba635rh4g42g2sgb2fvhfgqage3aw31g42ed6ggdfnfeqa8ygwejn4s63g5n"
}
```
5. Mine blocks using `/multi-mine' endpoint with JSON body as:
```
{
    "nodes": 8
}
```
