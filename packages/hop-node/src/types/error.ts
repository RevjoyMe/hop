export class BonderFeeTooLowError extends Error {}
export class RelayerFeeTooLowError extends Error {}
export class NonceTooLowError extends Error {}
export class EstimateGasError extends Error {}
export class PossibleReorgDetected extends Error {}
export class RedundantProviderOutOfSync extends Error {}
export class KmsSignerError extends Error {}
export class BonderTooEarlyError extends Error {}
export class BlockHashValidationError extends Error {}
export class UnfinalizedTransferBondError extends Error {}
// TODO: TMP Linea rm with other branch
export class MessageAlreadyClaimedError extends Error {}
