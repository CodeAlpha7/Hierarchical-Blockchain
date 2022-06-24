// Changing createNewBlock to accommodate TRANSACTION_THRESHOLD
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
	
	while(!this.pendingTransactions.length === 0){
		if(this.pendingTransactions.length > TRANSACTION_THRESHOLD){
			let endArray = this.pendingTransactions.length - TRANSACTION_THRESHOLD;
			const extraArray = this.pendingTransactions.slice(0, TRANSACTION_THRESHOLD);

			const newBlock = {
				index: this.chain.length + 1,
				timestamp: Date.now(),
				transactions: extraArray,
				nonce: nonce,
				hash: hash,
				previousBlockHash: previousBlockHash
			};

			this.pendingTransactions = this.pendingTransactions.slice(TRANSACTION_THRESHOLD, endArray);
			this.chain.push(newBlock);

			return newBlock;
		}
		else {
			const newBlock = {
				index: this.chain.length + 1,
				timestamp: Date.now(),
				transactions: this.pendingTransactions,
				nonce: nonce,
				hash: hash,
				previousBlockHash: previousBlockHash
			};
		
			this.pendingTransactions = [];
			this.chain.push(newBlock);

			return newBlock;
		}
		
	}

};