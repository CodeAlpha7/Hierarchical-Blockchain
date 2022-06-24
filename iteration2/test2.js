const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();

// for (var i=0; i<bitcoin.pendingTransactions.length; i++)
// {
//     console.log(bitcoin.pendingTransactions);
//     bitcoin.pendingTransactions = bitcoin.pendingTransactions.splice(0, 1);
// }

for(var i=0; i<10; i++) {
    bitcoin.pendingTransactions.push(i); 
}
console.log("Original Array: ")
console.log(bitcoin.pendingTransactions);

const extraArray = bitcoin.pendingTransactions.slice(0, 5);
console.log("Sliced Array: ")
console.log(extraArray);

console.log("Original Array: ")
console.log(bitcoin.pendingTransactions);


// const array = bitcoin.removeElements(2);

// console.log(array);
