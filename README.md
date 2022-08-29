# Funding SmartContract Hardhat Project

```shell
yarn hardhat clean
yarn hardhat compile
yarn hardhat test
yarn hardhat node
yarn hardhat help
yarn hardhat coverage
```

```shell
hardhat run --network ropsten scripts/deploy.ts
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```
