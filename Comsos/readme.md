## Implementing IBC on Cosmos Network
The following tutorial shows a step-by-step procedure to start a 2-LBC (hub-zone) blockchain architecture using IBC on Cosmos and simulate it. All references are made from the below links:
- Chain Simulation: https://docs.ignite.com/kb/simapp
- IBC implementation: https://docs.ignite.com/guide/ibc


**Note-1: All steps/commands mentioned are for Linux systems only (Ubuntu 22.04)** <br>
**Note-2: Procedure mentioned below is for a pre-scaffolded chain. If you are new and want to start from scratch, refer to the above documentations.**


### Procedure
1. Go to the following directory `~/example/src/cosmos-project/IBC/planet` and start the first blockchain using the following command: <br>
```
ignite chain serve -c earth.yml
```
2. Open a new terminal, and in the same directory as above start a second chain using the following command: <br>
```
ignite chain serve -c mars.yml
```

3. Open a new terminal and remove any existing relayer/IBC connection using the following command: <br>
```
rm -rf ~/.ignite/relayer
```

4. Just below that, type the following command to setup and configure the chains by specifying RPC and faucets to receive tokens from: <br>
```
ignite relayer configure -a \
  --source-rpc "http://0.0.0.0:26657" \
  --source-faucet "http://0.0.0.0:4500" \
  --source-port "blog" \
  --source-version "blog-1" \
  --source-gasprice "0.0000025stake" \
  --source-prefix "cosmos" \
  --source-gaslimit 300000 \
  --target-rpc "http://0.0.0.0:26659" \
  --target-faucet "http://0.0.0.0:4501" \
  --target-port "blog" \
  --target-version "blog-1" \
  --target-gasprice "0.0000025stake" \
  --target-prefix "cosmos" \
  --target-gaslimit 300000
```

5. Open a new terminal and type the following command to connect the 2 newly created blockchains: <br>
```
ignite relayer connect
```

<br>
Both blockchains are now connected and ready to receive IBC packets between each other.
<br>

### Chain Simulation
To simulate the configured chain, you can open a new terminal, but stay in the same directory where the chains are running and have been configured. Type the following command:
```
ignite chain simulate -v --numBlocks 200 --blockSize 50 --seed 33
```
<br>
OR
<br>

```
go test -v -benchmem -run=^$ -bench ^BenchmarkSimulation -cpuprofile cpu.out ./app -Commit=true
```

