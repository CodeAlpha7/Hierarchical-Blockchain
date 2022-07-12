## Hierarchical model
Latest release on custom blockchain.

### Features
1. Implemented binary semaphore (mutex lock) to deal with critical section on the bridge Node (global Blockchain)
2. Changes to express endpoints to enable simultaneous multi-node commits. This is using the /multi-mine endpoint
3. Changes to incorporate the above 2 cases.


### Note:
- Changes made to package.json to allow varying nodes for testing with differing LBC and node count to test scalability with varying infrastructure.
- Currently 17 nodes exist where 2 LBCs have 8 nodes each and one acts as bridge.
