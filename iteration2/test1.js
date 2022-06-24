function Blockchain() {
	this.chain = [];
	this.pendingTransactions = [];

	this.currentNodeUrl = currentNodeUrl;
	this.networkNodes = [];

};

Blockchain.prototype.removeElements = function(value) {
	this.pendingTransactions = this.pendingTransactions.splice(0, value);

	return this.pendingTransactions;
};




module.exports = Blockchain;
