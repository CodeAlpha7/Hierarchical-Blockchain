const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
// var bridgeNode = require('./blockchain');
const uuid = require('uuid/v1');
const port = process.argv[2];
const rp = require('request-promise');
const sha256 = require('sha256');
const TRANSACTION_THRESHOLD = 5;

const nodeAddress = uuid().split('-').join('');

const bitcoin = new Blockchain();
const bridgeNode = new Blockchain();


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));




// get entire blockchain
app.get('/blockchain', function (req, res) {
  res.send(bitcoin);
});

app.get('/bridge', function (req, res) {
	res.send(bridgeNode);
});


// create a new transaction
app.post('/transaction', function(req, res) {
	const newTransaction = req.body;
	const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
	res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

// app.post('/bridgeTransaction', function(req, res) {
// 	const newTransaction = req.body;
// 	const blockIndex = bridgeNode.addTransactionToPendingTransactions(newTransaction);
// 	res.json({ note: `Transaction will be added in block ${blockIndex}.` });
// });


app.post('/multiple-txns', function(req, res) {

	var iteration = req.body.number;
	const requestPromises = [];
	for (var i = 1; i<=iteration; i++) {
		const amount = req.body.amount + i;
		const amount2 = amount + i;
		const dataAsString1 = JSON.stringify(amount);
		const dataAsString2 = JSON.stringify(amount2);
		const hash1 = sha256(dataAsString1);
		const hash2 = sha256(dataAsString2);
		const newTransaction = bitcoin.createNewTransaction(amount, hash1, hash2);
		// const newTransaction2 = bridgeNode.createNewTransaction(amount, hash1, hash2);
		bitcoin.addTransactionToPendingTransactions(newTransaction);
		// bridgeNode.addTransactionToPendingTransactions(newTransaction2);

		
		bitcoin.networkNodes.forEach(networkNodeUrl => {
			const requestOptions = {
				uri: networkNodeUrl + '/transaction',
				method: 'POST',
				body: newTransaction,
				json: true
			};

			requestPromises.push(rp(requestOptions));
		});

		// bridgeNode.networkNodes.forEach(networkNodeUrl => {
		// 	const requestOptions = {
		// 		uri: 'http://localhost:3006/bridgeTransaction',
		// 		method: 'POST',
		// 		body: newTransaction2,
		// 		json: true
		// 	};

		// 	requestPromises.push(rp(bridgeNodeOptions));
		// });


	};

		Promise.all(requestPromises)
		.then(data => {
			res.json({ note: `${i-1} Transactions created and broadcast successfully.` });
		});
	
});



// broadcast transaction
app.post('/transaction/broadcast', function(req, res) {
	const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
	bitcoin.addTransactionToPendingTransactions(newTransaction);

	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/transaction',
			method: 'POST',
			body: newTransaction,
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		res.json({ note: 'Transaction created and broadcast successfully.' });
	});
});



app.post('/mine-pos', function (req, res) {
	var nodes = req.body.nodes;
	const leader = bitcoin.proofOfStake(nodes);
	const requestPromises = [];
	const bridgeNodeOptions = {
		uri: 'http://localhost:300' + leader + '/leader-mine',
		method: 'GET',
		// body: {newBlock: newBlock2},
		json: true
	};
	requestPromises.push(rp(bridgeNodeOptions));
	

	Promise.all(requestPromises)
	.then(data => {
		res.json({
			note: `New blocks mined by node ${leader} & broadcast successfully`,
		});
	});
  });



app.get('/leader-mine', function (req, res) {
	const requestPromises = [];
	while(!bitcoin.pendingTransactions.length < 1) {
		

		if(bitcoin.pendingTransactions.length > TRANSACTION_THRESHOLD){

			const extraArray = bitcoin.pendingTransactions.slice(0, TRANSACTION_THRESHOLD);
			const lastBlock = bitcoin.getLastBlock();
			const lastBlock2 = bridgeNode.getLastBlock();
			const previousBlockHash = lastBlock['hash'];
			const previousBlockHash2 = lastBlock2['hash'];
			const currentBlockData = {
				transactions: extraArray,
				index: lastBlock['index'] + 1
			};
			const currentBlockData2 = {
				transactions: extraArray,
				index: lastBlock2['index'] + 1
			};
			const blockHash = bitcoin.hashBlockPOS(previousBlockHash, currentBlockData);
			const blockHash2 = bridgeNode.hashBlockPOS(previousBlockHash2, currentBlockData2);

			let { newBlock, returnedArray} = bitcoin.createNewBlockPOS(previousBlockHash, blockHash);

			const newBlock2 = bridgeNode.createBridgeBlockPOS(previousBlockHash2, blockHash2, returnedArray);

			bitcoin.pendingTransactions.splice(0, TRANSACTION_THRESHOLD);


			bitcoin.networkNodes.forEach(networkNodeUrl => {
				const requestOptions = {
					uri: networkNodeUrl + '/receive-new-block',
					method: 'POST',
					body: { newBlock: newBlock },
					json: true
				};
		
				requestPromises.push(rp(requestOptions));

			});

			const bridgeNodeOptions = {
				uri: 'http://localhost:3006/receive-global',
				method: 'POST',
				body: {newBlock: newBlock2},
				json: true
			};

			requestPromises.push(rp(bridgeNodeOptions));
		}


		else {
			
			const lastBlock = bitcoin.getLastBlock();
			const prevBlock = bridgeNode.getLastBlock();
			const previousBlockHash = lastBlock['hash'];
			const previousBlockHash2 = prevBlock['hash'];
			const currentBlockData = {
				transactions: bitcoin.pendingTransactions,
				index: lastBlock['index'] + 1
			};
			const currentBlockData2 = {
				transactions: bitcoin.pendingTransactions,
				index: prevBlock['index'] + 1
			};
			const blockHash = bitcoin.hashBlockPOS(previousBlockHash, currentBlockData);
			const blockHash2 = bridgeNode.hashBlockPOS(previousBlockHash2, currentBlockData2);

			let { newBlock, returnedArray} = bitcoin.createSingleBlockPOS(previousBlockHash, blockHash);
			const newBlock2 = bridgeNode.BridgeSingleBlockPOS(previousBlockHash2, blockHash2, returnedArray);
		


			bitcoin.networkNodes.forEach(networkNodeUrl => {
				const requestOptions = {
					uri: networkNodeUrl + '/receive-new-block',
					method: 'POST',
					body: { newBlock: newBlock },
					json: true
				};
		
				requestPromises.push(rp(requestOptions));
			});

			const bridgeNodeOptions = {
				uri: 'http://localhost:3006/receive-global',
				method: 'POST',
				body: {newBlock: newBlock2},
				json: true
			};

			requestPromises.push(rp(bridgeNodeOptions));
		
		}
	}

	Promise.all(requestPromises)												// this also means that for how many ever individual blocks mined, only one reward is given.
	.then(data => {
		const requestOptions = {
			uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
			method: 'POST',
			body: {
				amount: 12.5,
				sender: "00",
				recipient: nodeAddress
			},
			json: true
		};

		return rp(requestOptions);
	})
	.then(data => {
		res.json({
			note: "New blocks mined & broadcast successfully",
			// block: newBlock
		});
	});

  });


// mine a block
app.get('/mine', function(req, res) {
	
	const requestPromises = [];
	while(!bitcoin.pendingTransactions.length < 1) {
		

		if(bitcoin.pendingTransactions.length > TRANSACTION_THRESHOLD){

			const extraArray = bitcoin.pendingTransactions.slice(0, TRANSACTION_THRESHOLD);
			// const extraArray2 = bridgeNode.pendingTransactions.slice(0, TRANSACTION_THRESHOLD);
			const lastBlock = bitcoin.getLastBlock();
			const lastBlock2 = bridgeNode.getLastBlock();
			const previousBlockHash = lastBlock['hash'];
			const previousBlockHash2 = lastBlock2['hash'];
			const currentBlockData = {
				transactions: extraArray,
				index: lastBlock['index'] + 1
			};
			const currentBlockData2 = {
				transactions: extraArray,
				index: lastBlock2['index'] + 1
			};
			const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
			const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
			const blockHash2 = bridgeNode.hashBlock(previousBlockHash2, currentBlockData2, nonce);

			// const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
			let { newBlock, returnedArray} = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

			const newBlock2 = bridgeNode.createBridgeBlock(nonce, previousBlockHash2, blockHash2, returnedArray);

			bitcoin.pendingTransactions.splice(0, TRANSACTION_THRESHOLD);
			// bridgeNode.pendingTransactions.splice(0, TRANSACTION_THRESHOLD);


			bitcoin.networkNodes.forEach(networkNodeUrl => {
				const requestOptions = {
					uri: networkNodeUrl + '/receive-new-block',
					method: 'POST',
					body: { newBlock: newBlock },
					json: true
				};
		
				requestPromises.push(rp(requestOptions));

			});


							
				// to represent a connected blockchain divide {single BC with 10 nodes} into
				// {2 BCs with 5 nodes each} plus a bridgeNode in between
				//separately add every block to this hardcoded URI. 
				// This BridgeNode plays the role of Global Blockchain. Other 2 BCs have their own blocks only.
				// but this bridgeNode has every block on the chain. So, super chain.

				// this is different than the global blockchain initially planned which only maintains state and
				//does not contain blocks itself, but an intermediate representation to show scalability.

				// so during authentication when node device cannot find txn in local BC, can access bridgeNode

				// in "register-and-broadcast-node" do NOT connect with this bridgeNode



			const bridgeNodeOptions = {
				uri: 'http://localhost:3006/receive-global',
				method: 'POST',
				body: {newBlock: newBlock2},
				json: true
			};

			requestPromises.push(rp(bridgeNodeOptions));
		}


		else {
			
			const lastBlock = bitcoin.getLastBlock();
			const prevBlock = bridgeNode.getLastBlock();
			const previousBlockHash = lastBlock['hash'];
			const previousBlockHash2 = prevBlock['hash'];
			const currentBlockData = {
				transactions: bitcoin.pendingTransactions,
				index: lastBlock['index'] + 1
			};
			const currentBlockData2 = {
				transactions: bitcoin.pendingTransactions,
				index: prevBlock['index'] + 1
			};
			const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
			const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
			const blockHash2 = bridgeNode.hashBlock(previousBlockHash2, currentBlockData2, nonce);

			let { newBlock, returnedArray} = bitcoin.createSingleBlock(nonce, previousBlockHash, blockHash);
			const newBlock2 = bridgeNode.BridgeSingleBlock(nonce, previousBlockHash2, blockHash2, returnedArray);
			// const newBlock2 = bridgeNode.createNewBlock(nonce, previousBlockHash2, blockHash2);
		


			bitcoin.networkNodes.forEach(networkNodeUrl => {
				const requestOptions = {
					uri: networkNodeUrl + '/receive-new-block',
					method: 'POST',
					body: { newBlock: newBlock },
					json: true
				};
		
				requestPromises.push(rp(requestOptions));
			});

			const bridgeNodeOptions = {
				uri: 'http://localhost:3006/receive-global',
				method: 'POST',
				body: {newBlock: newBlock2},
				json: true
			};

			requestPromises.push(rp(bridgeNodeOptions));
		
		}
	}

	Promise.all(requestPromises)												// this also means that for how many ever individual blocks mined, only one reward is given.
	.then(data => {
		const requestOptions = {
			uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
			method: 'POST',
			body: {
				amount: 12.5,
				sender: "00",
				recipient: nodeAddress
			},
			json: true
		};

		return rp(requestOptions);
	})
	.then(data => {
		res.json({
			note: "New blocks mined & broadcast successfully",
			// block: newBlock
		});
	});

});



// receive new block
app.post('/receive-new-block', function(req, res) {
	const newBlock = req.body.newBlock;
	const lastBlock = bitcoin.getLastBlock();
	// const lastBlock2 = bridgeNode.getLastBlock();
	const correctHash = lastBlock.hash === newBlock.previousBlockHash;
	// const correctHash2 = lastBlock2.hash === newBlock.previousBlockHash; 
	const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
	// const correctIndex2 = lastBlock2['index'] + 1 === newBlock['index'];

	if (correctHash && correctIndex) {
		bitcoin.chain.push(newBlock);
		bitcoin.pendingTransactions = [];
		// bridgeNode.chain.push(newBlock);
		// bridgeNode.pendingTransactions = [];
		res.json({
			note: 'New block received and accepted.',
			newBlock: newBlock
		});
	} else {
		res.json({
			note: 'New block rejected.',
			newBlock: newBlock
		});
	}
});

app.post('/receive-global', function(req, res) {
	const newBlock = req.body.newBlock;
	// const lastBlock = bitcoin.getLastBlock();
	// // const lastBlock2 = bridgeNode.getLastBlock();
	// const correctHash = lastBlock.hash === newBlock.previousBlockHash;
	// // const correctHash2 = lastBlock2.hash === newBlock.previousBlockHash; 
	// const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
	// // const correctIndex2 = lastBlock2['index'] + 1 === newBlock['index'];

	// if (correctHash && correctIndex) {
		bridgeNode.chain.push(newBlock);
		// bitcoin.pendingTransactions = [];
		// bridgeNode.chain.push(newBlock);
		// bridgeNode.pendingTransactions = [];
		res.json({
			note: 'New block received and accepted.',
			newBlock: newBlock
		});
	// }
});


// register a node and broadcast it the network
app.post('/register-and-broadcast-node', function(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl);

	const regNodesPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/register-node',
			method: 'POST',
			body: { newNodeUrl: newNodeUrl },
			json: true
		};

		regNodesPromises.push(rp(requestOptions));
	});

	Promise.all(regNodesPromises)
	.then(data => {
		const bulkRegisterOptions = {
			uri: newNodeUrl + '/register-nodes-bulk',
			method: 'POST',
			body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ] },
			json: true
		};

		return rp(bulkRegisterOptions);
	})
	.then(data => {
		res.json({ note: 'New node registered with network successfully.' });
	});
});


// register a node with the network
app.post('/register-node', function(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
	const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
	if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
	res.json({ note: 'New node registered successfully.' });
});


// register multiple nodes at once
app.post('/register-nodes-bulk', function(req, res) {
	const allNetworkNodes = req.body.allNetworkNodes;
	allNetworkNodes.forEach(networkNodeUrl => {
		const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
		const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
		if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);
	});

	res.json({ note: 'Bulk registration successful.' });
});


// consensus
app.get('/consensus', function(req, res) {
	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(blockchains => {
		const currentChainLength = bitcoin.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;

		blockchains.forEach(blockchain => {
			if (blockchain.chain.length > maxChainLength) {
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
				newPendingTransactions = blockchain.pendingTransactions;
			};
		});


		if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
			res.json({
				note: 'Current chain has not been replaced.',
				chain: bitcoin.chain
			});
		}
		else {
			bitcoin.chain = newLongestChain;
			bitcoin.pendingTransactions = newPendingTransactions;
			res.json({
				note: 'This chain has been replaced.',
				chain: bitcoin.chain
			});
		}
	});
});


// get block by blockHash
app.get('/block/:blockHash', function(req, res) { 
	const blockHash = req.params.blockHash;
	const correctBlock = bitcoin.getBlock(blockHash);
	res.json({
		block: correctBlock
	});
});


// get transaction by transactionId
app.get('/transaction/:transactionId', function(req, res) {
	const transactionId = req.params.transactionId;
	const trasactionData = bitcoin.getTransaction(transactionId);
	res.json({
		transaction: trasactionData.transaction,
		block: trasactionData.block
	});
});


// get address by address
app.get('/address/:address', function(req, res) {
	const address = req.params.address;
	const addressData = bitcoin.getAddressData(address);
	res.json({
		addressData: addressData
	});
});


// block explorer
app.get('/block-explorer', function(req, res) {
	res.sendFile('./block-explorer/index.html', { root: __dirname });
});





app.listen(port, function() {
	console.log(`Listening on port ${port}...`);
});




// module.exports = bridgeNode;