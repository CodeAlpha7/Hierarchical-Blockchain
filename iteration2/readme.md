## Updated Features
- More configurability with TRANSACTION_THRESHOLD allowing fixed block sizes.
- Singular reward consolidation for grouped block mining.

### Bug Fixes

- Fixed res.json() looping error causing host crashes. requestPromises[ ] made global.
- Fixed issues with module exports. Actually was due to wrong constructor object declaration in the wrong location.
- Fixed multiple-txn counter misalignment due to end-of-loop non-consideration
- Fixed shallow copy issues by invoking direct reference to pendingTransactions array instance relevant to the particular constructor object.


<br/><br/>
#### Note: 
- Request-Promise library has been deprecated. Be wary with changes.
- Much of the code in this release has been commented out due to configuration errors. Code as it is works flawlessly. However, normal functionality is NOT guaranteed if commented code is let out its cage. 
- Also contains draft code for bridgeNode which is the implementation of cross-chain API representing the global blockchain. The code has not been completed and needed further work.
