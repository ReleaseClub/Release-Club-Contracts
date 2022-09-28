## NOTE

These are the original Release Club contracts written for the metabolism hackathon. This repo has been archived and all future development will take place in https://github.com/ReleaseClub/club-protocol. The original contracts will live on in https://github.com/ReleaseClub/metabolism.

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
