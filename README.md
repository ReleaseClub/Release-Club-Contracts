### Deploy and verify the contracts

- For the main contract

```
npx hardhat run scripts/deploy.ts --network rinkeby
```

- For the factory contract

```
npx hardhat run scripts/deployFactory.ts --network rinkeby
```

### Create a club

Call the `createClub` function from the proxy contract.
The address returned is the address of the new club.
