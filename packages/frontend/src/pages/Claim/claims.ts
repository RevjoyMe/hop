import Address from '#models/Address.js'
import { BigNumber, Signer, providers } from 'ethers'
import { Delegate, TokenClaim } from '#pages/Claim/useClaim.js'
import { ShardedMerkleTree, getEntryProofIndex } from '#pages/Claim/merkle.js'
import { claimChainId, claimTokenAddress } from '#pages/Claim/config.js'
import { getClaimTokenContract } from '#utils/contracts.js'

const claimChains = {
  1: {
    id: 1,
    name: 'Ethereum Main'
  },
  31337: {
    id: 31337,
    name: 'Hardhat (31337)'
  },
  5: {
    id: 5,
    name: 'Goerli'
  }
}

export const correctClaimChain = claimChains[claimChainId]

export async function fetchClaim(provider: providers.Provider, address: Address) {
  const ensToken = await getClaimTokenContract(provider, claimTokenAddress)

  const shardedMerkleTree = await ShardedMerkleTree.fetchTree()
  const [entry, proof] = await shardedMerkleTree.getProof(address?.address?.toLowerCase())

  const idx = getEntryProofIndex(address?.address, entry, proof)

  if (typeof idx !== 'undefined') {
    const isClaimed = await ensToken.isClaimed(idx)

    return { entry, proof, address, isClaimed }
  }
}

export async function claimTokens(signer: Signer, claim: TokenClaim, delegate: Delegate) {
  const ensToken = await getClaimTokenContract(signer, claimTokenAddress)

  console.log('claim balance:', claim.entry.balance)
  console.log('claim delegate:', delegate.address!.address)
  console.log('claim proof:', claim.proof)
  // const populatedTx = await ensToken.populateTransaction.claimTokens(claim.entry.balance, delegate.address!.address, claim.proof)
  // console.log('claim populatedTx:', populatedTx)

  return ensToken.claimTokens(claim.entry.balance, delegate.address!.address, claim.proof, {
    gasLimit: BigNumber.from(250_000)
  })
}

export async function getVotes(provider: any, delegateAddress: string) {
  const ensToken = await getClaimTokenContract(provider, claimTokenAddress)
  return ensToken.getVotes(delegateAddress)
}

export async function getContractBalance(provider: any) {
  const ensToken = await getClaimTokenContract(provider, claimTokenAddress)
  return ensToken.balanceOf(ensToken.address)
}

export async function getMerkleRoot(provider: any) {
  const ensToken = await getClaimTokenContract(provider, claimTokenAddress)
  return ensToken.merkleRoot()
}

export async function getAirdropSupply(provider: any) {
  // TODO: pull from root.json
  return BigNumber.from('54818880996683704802030999')
}
