/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common.js";

export declare namespace Bridge {
  export type TransferRootStruct = {
    total: PromiseOrValue<BigNumberish>;
    amountWithdrawn: PromiseOrValue<BigNumberish>;
    createdAt: PromiseOrValue<BigNumberish>;
  };

  export type TransferRootStructOutput = [BigNumber, BigNumber, BigNumber] & {
    total: BigNumber;
    amountWithdrawn: BigNumber;
    createdAt: BigNumber;
  };
}

export interface BridgeInterface extends utils.Interface {
  functions: {
    "addBonder(address)": FunctionFragment;
    "bondWithdrawal(address,uint256,bytes32,uint256)": FunctionFragment;
    "getBondedWithdrawalAmount(address,bytes32)": FunctionFragment;
    "getChainId()": FunctionFragment;
    "getCredit(address)": FunctionFragment;
    "getDebitAndAdditionalDebit(address)": FunctionFragment;
    "getIsBonder(address)": FunctionFragment;
    "getRawDebit(address)": FunctionFragment;
    "getTransferId(uint256,address,uint256,bytes32,uint256,uint256,uint256)": FunctionFragment;
    "getTransferRoot(bytes32,uint256)": FunctionFragment;
    "getTransferRootId(bytes32,uint256)": FunctionFragment;
    "isTransferIdSpent(bytes32)": FunctionFragment;
    "removeBonder(address)": FunctionFragment;
    "rescueTransferRoot(bytes32,uint256,address)": FunctionFragment;
    "settleBondedWithdrawal(address,bytes32,bytes32,uint256,uint256,bytes32[],uint256)": FunctionFragment;
    "settleBondedWithdrawals(address,bytes32[],uint256)": FunctionFragment;
    "stake(address,uint256)": FunctionFragment;
    "unstake(uint256)": FunctionFragment;
    "withdraw(address,uint256,bytes32,uint256,uint256,uint256,bytes32,uint256,uint256,bytes32[],uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addBonder"
      | "bondWithdrawal"
      | "getBondedWithdrawalAmount"
      | "getChainId"
      | "getCredit"
      | "getDebitAndAdditionalDebit"
      | "getIsBonder"
      | "getRawDebit"
      | "getTransferId"
      | "getTransferRoot"
      | "getTransferRootId"
      | "isTransferIdSpent"
      | "removeBonder"
      | "rescueTransferRoot"
      | "settleBondedWithdrawal"
      | "settleBondedWithdrawals"
      | "stake"
      | "unstake"
      | "withdraw"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addBonder",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "bondWithdrawal",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getBondedWithdrawalAmount",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "getChainId",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCredit",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getDebitAndAdditionalDebit",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getIsBonder",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getRawDebit",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getTransferId",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getTransferRoot",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getTransferRootId",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "isTransferIdSpent",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "removeBonder",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "rescueTransferRoot",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "settleBondedWithdrawal",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>[],
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "settleBondedWithdrawals",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>[],
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "stake",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "unstake",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>[],
      PromiseOrValue<BigNumberish>
    ]
  ): string;

  decodeFunctionResult(functionFragment: "addBonder", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "bondWithdrawal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBondedWithdrawalAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getChainId", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getCredit", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getDebitAndAdditionalDebit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getIsBonder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRawDebit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTransferId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTransferRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTransferRootId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isTransferIdSpent",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removeBonder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "rescueTransferRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "settleBondedWithdrawal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "settleBondedWithdrawals",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "stake", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "unstake", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {
    "BonderAdded(address)": EventFragment;
    "BonderRemoved(address)": EventFragment;
    "MultipleWithdrawalsSettled(address,bytes32,uint256)": EventFragment;
    "Stake(address,uint256)": EventFragment;
    "TransferRootSet(bytes32,uint256)": EventFragment;
    "Unstake(address,uint256)": EventFragment;
    "WithdrawalBondSettled(address,bytes32,bytes32)": EventFragment;
    "WithdrawalBonded(bytes32,uint256)": EventFragment;
    "Withdrew(bytes32,address,uint256,bytes32)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "BonderAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BonderRemoved"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "MultipleWithdrawalsSettled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Stake"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TransferRootSet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Unstake"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "WithdrawalBondSettled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "WithdrawalBonded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Withdrew"): EventFragment;
}

export interface BonderAddedEventObject {
  newBonder: string;
}
export type BonderAddedEvent = TypedEvent<[string], BonderAddedEventObject>;

export type BonderAddedEventFilter = TypedEventFilter<BonderAddedEvent>;

export interface BonderRemovedEventObject {
  previousBonder: string;
}
export type BonderRemovedEvent = TypedEvent<[string], BonderRemovedEventObject>;

export type BonderRemovedEventFilter = TypedEventFilter<BonderRemovedEvent>;

export interface MultipleWithdrawalsSettledEventObject {
  bonder: string;
  rootHash: string;
  totalBondsSettled: BigNumber;
}
export type MultipleWithdrawalsSettledEvent = TypedEvent<
  [string, string, BigNumber],
  MultipleWithdrawalsSettledEventObject
>;

export type MultipleWithdrawalsSettledEventFilter =
  TypedEventFilter<MultipleWithdrawalsSettledEvent>;

export interface StakeEventObject {
  account: string;
  amount: BigNumber;
}
export type StakeEvent = TypedEvent<[string, BigNumber], StakeEventObject>;

export type StakeEventFilter = TypedEventFilter<StakeEvent>;

export interface TransferRootSetEventObject {
  rootHash: string;
  totalAmount: BigNumber;
}
export type TransferRootSetEvent = TypedEvent<
  [string, BigNumber],
  TransferRootSetEventObject
>;

export type TransferRootSetEventFilter = TypedEventFilter<TransferRootSetEvent>;

export interface UnstakeEventObject {
  account: string;
  amount: BigNumber;
}
export type UnstakeEvent = TypedEvent<[string, BigNumber], UnstakeEventObject>;

export type UnstakeEventFilter = TypedEventFilter<UnstakeEvent>;

export interface WithdrawalBondSettledEventObject {
  bonder: string;
  transferId: string;
  rootHash: string;
}
export type WithdrawalBondSettledEvent = TypedEvent<
  [string, string, string],
  WithdrawalBondSettledEventObject
>;

export type WithdrawalBondSettledEventFilter =
  TypedEventFilter<WithdrawalBondSettledEvent>;

export interface WithdrawalBondedEventObject {
  transferId: string;
  amount: BigNumber;
}
export type WithdrawalBondedEvent = TypedEvent<
  [string, BigNumber],
  WithdrawalBondedEventObject
>;

export type WithdrawalBondedEventFilter =
  TypedEventFilter<WithdrawalBondedEvent>;

export interface WithdrewEventObject {
  transferId: string;
  recipient: string;
  amount: BigNumber;
  transferNonce: string;
}
export type WithdrewEvent = TypedEvent<
  [string, string, BigNumber, string],
  WithdrewEventObject
>;

export type WithdrewEventFilter = TypedEventFilter<WithdrewEvent>;

export interface Bridge extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: BridgeInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    addBonder(
      bonder: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    bondWithdrawal(
      recipient: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      transferNonce: PromiseOrValue<BytesLike>,
      bonderFee: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getBondedWithdrawalAmount(
      bonder: PromiseOrValue<string>,
      transferId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getChainId(
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { chainId: BigNumber }>;

    getCredit(
      bonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getDebitAndAdditionalDebit(
      bonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getIsBonder(
      maybeBonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    getRawDebit(
      bonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getTransferId(
      chainId: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      transferNonce: PromiseOrValue<BytesLike>,
      bonderFee: PromiseOrValue<BigNumberish>,
      amountOutMin: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getTransferRoot(
      rootHash: PromiseOrValue<BytesLike>,
      totalAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[Bridge.TransferRootStructOutput]>;

    getTransferRootId(
      rootHash: PromiseOrValue<BytesLike>,
      totalAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    isTransferIdSpent(
      transferId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    removeBonder(
      bonder: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    rescueTransferRoot(
      rootHash: PromiseOrValue<BytesLike>,
      originalAmount: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    settleBondedWithdrawal(
      bonder: PromiseOrValue<string>,
      transferId: PromiseOrValue<BytesLike>,
      rootHash: PromiseOrValue<BytesLike>,
      transferRootTotalAmount: PromiseOrValue<BigNumberish>,
      transferIdTreeIndex: PromiseOrValue<BigNumberish>,
      siblings: PromiseOrValue<BytesLike>[],
      totalLeaves: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    settleBondedWithdrawals(
      bonder: PromiseOrValue<string>,
      transferIds: PromiseOrValue<BytesLike>[],
      totalAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    stake(
      bonder: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    unstake(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdraw(
      recipient: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      transferNonce: PromiseOrValue<BytesLike>,
      bonderFee: PromiseOrValue<BigNumberish>,
      amountOutMin: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      rootHash: PromiseOrValue<BytesLike>,
      transferRootTotalAmount: PromiseOrValue<BigNumberish>,
      transferIdTreeIndex: PromiseOrValue<BigNumberish>,
      siblings: PromiseOrValue<BytesLike>[],
      totalLeaves: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  addBonder(
    bonder: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  bondWithdrawal(
    recipient: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    transferNonce: PromiseOrValue<BytesLike>,
    bonderFee: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getBondedWithdrawalAmount(
    bonder: PromiseOrValue<string>,
    transferId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getChainId(overrides?: CallOverrides): Promise<BigNumber>;

  getCredit(
    bonder: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getDebitAndAdditionalDebit(
    bonder: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getIsBonder(
    maybeBonder: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  getRawDebit(
    bonder: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getTransferId(
    chainId: PromiseOrValue<BigNumberish>,
    recipient: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    transferNonce: PromiseOrValue<BytesLike>,
    bonderFee: PromiseOrValue<BigNumberish>,
    amountOutMin: PromiseOrValue<BigNumberish>,
    deadline: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  getTransferRoot(
    rootHash: PromiseOrValue<BytesLike>,
    totalAmount: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<Bridge.TransferRootStructOutput>;

  getTransferRootId(
    rootHash: PromiseOrValue<BytesLike>,
    totalAmount: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  isTransferIdSpent(
    transferId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  removeBonder(
    bonder: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  rescueTransferRoot(
    rootHash: PromiseOrValue<BytesLike>,
    originalAmount: PromiseOrValue<BigNumberish>,
    recipient: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  settleBondedWithdrawal(
    bonder: PromiseOrValue<string>,
    transferId: PromiseOrValue<BytesLike>,
    rootHash: PromiseOrValue<BytesLike>,
    transferRootTotalAmount: PromiseOrValue<BigNumberish>,
    transferIdTreeIndex: PromiseOrValue<BigNumberish>,
    siblings: PromiseOrValue<BytesLike>[],
    totalLeaves: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  settleBondedWithdrawals(
    bonder: PromiseOrValue<string>,
    transferIds: PromiseOrValue<BytesLike>[],
    totalAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  stake(
    bonder: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  unstake(
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdraw(
    recipient: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    transferNonce: PromiseOrValue<BytesLike>,
    bonderFee: PromiseOrValue<BigNumberish>,
    amountOutMin: PromiseOrValue<BigNumberish>,
    deadline: PromiseOrValue<BigNumberish>,
    rootHash: PromiseOrValue<BytesLike>,
    transferRootTotalAmount: PromiseOrValue<BigNumberish>,
    transferIdTreeIndex: PromiseOrValue<BigNumberish>,
    siblings: PromiseOrValue<BytesLike>[],
    totalLeaves: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addBonder(
      bonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    bondWithdrawal(
      recipient: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      transferNonce: PromiseOrValue<BytesLike>,
      bonderFee: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    getBondedWithdrawalAmount(
      bonder: PromiseOrValue<string>,
      transferId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getChainId(overrides?: CallOverrides): Promise<BigNumber>;

    getCredit(
      bonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getDebitAndAdditionalDebit(
      bonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getIsBonder(
      maybeBonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    getRawDebit(
      bonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTransferId(
      chainId: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      transferNonce: PromiseOrValue<BytesLike>,
      bonderFee: PromiseOrValue<BigNumberish>,
      amountOutMin: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    getTransferRoot(
      rootHash: PromiseOrValue<BytesLike>,
      totalAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<Bridge.TransferRootStructOutput>;

    getTransferRootId(
      rootHash: PromiseOrValue<BytesLike>,
      totalAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    isTransferIdSpent(
      transferId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    removeBonder(
      bonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    rescueTransferRoot(
      rootHash: PromiseOrValue<BytesLike>,
      originalAmount: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    settleBondedWithdrawal(
      bonder: PromiseOrValue<string>,
      transferId: PromiseOrValue<BytesLike>,
      rootHash: PromiseOrValue<BytesLike>,
      transferRootTotalAmount: PromiseOrValue<BigNumberish>,
      transferIdTreeIndex: PromiseOrValue<BigNumberish>,
      siblings: PromiseOrValue<BytesLike>[],
      totalLeaves: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    settleBondedWithdrawals(
      bonder: PromiseOrValue<string>,
      transferIds: PromiseOrValue<BytesLike>[],
      totalAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    stake(
      bonder: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    unstake(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    withdraw(
      recipient: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      transferNonce: PromiseOrValue<BytesLike>,
      bonderFee: PromiseOrValue<BigNumberish>,
      amountOutMin: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      rootHash: PromiseOrValue<BytesLike>,
      transferRootTotalAmount: PromiseOrValue<BigNumberish>,
      transferIdTreeIndex: PromiseOrValue<BigNumberish>,
      siblings: PromiseOrValue<BytesLike>[],
      totalLeaves: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "BonderAdded(address)"(
      newBonder?: PromiseOrValue<string> | null
    ): BonderAddedEventFilter;
    BonderAdded(
      newBonder?: PromiseOrValue<string> | null
    ): BonderAddedEventFilter;

    "BonderRemoved(address)"(
      previousBonder?: PromiseOrValue<string> | null
    ): BonderRemovedEventFilter;
    BonderRemoved(
      previousBonder?: PromiseOrValue<string> | null
    ): BonderRemovedEventFilter;

    "MultipleWithdrawalsSettled(address,bytes32,uint256)"(
      bonder?: PromiseOrValue<string> | null,
      rootHash?: PromiseOrValue<BytesLike> | null,
      totalBondsSettled?: null
    ): MultipleWithdrawalsSettledEventFilter;
    MultipleWithdrawalsSettled(
      bonder?: PromiseOrValue<string> | null,
      rootHash?: PromiseOrValue<BytesLike> | null,
      totalBondsSettled?: null
    ): MultipleWithdrawalsSettledEventFilter;

    "Stake(address,uint256)"(
      account?: PromiseOrValue<string> | null,
      amount?: null
    ): StakeEventFilter;
    Stake(
      account?: PromiseOrValue<string> | null,
      amount?: null
    ): StakeEventFilter;

    "TransferRootSet(bytes32,uint256)"(
      rootHash?: PromiseOrValue<BytesLike> | null,
      totalAmount?: null
    ): TransferRootSetEventFilter;
    TransferRootSet(
      rootHash?: PromiseOrValue<BytesLike> | null,
      totalAmount?: null
    ): TransferRootSetEventFilter;

    "Unstake(address,uint256)"(
      account?: PromiseOrValue<string> | null,
      amount?: null
    ): UnstakeEventFilter;
    Unstake(
      account?: PromiseOrValue<string> | null,
      amount?: null
    ): UnstakeEventFilter;

    "WithdrawalBondSettled(address,bytes32,bytes32)"(
      bonder?: PromiseOrValue<string> | null,
      transferId?: PromiseOrValue<BytesLike> | null,
      rootHash?: PromiseOrValue<BytesLike> | null
    ): WithdrawalBondSettledEventFilter;
    WithdrawalBondSettled(
      bonder?: PromiseOrValue<string> | null,
      transferId?: PromiseOrValue<BytesLike> | null,
      rootHash?: PromiseOrValue<BytesLike> | null
    ): WithdrawalBondSettledEventFilter;

    "WithdrawalBonded(bytes32,uint256)"(
      transferId?: PromiseOrValue<BytesLike> | null,
      amount?: null
    ): WithdrawalBondedEventFilter;
    WithdrawalBonded(
      transferId?: PromiseOrValue<BytesLike> | null,
      amount?: null
    ): WithdrawalBondedEventFilter;

    "Withdrew(bytes32,address,uint256,bytes32)"(
      transferId?: PromiseOrValue<BytesLike> | null,
      recipient?: PromiseOrValue<string> | null,
      amount?: null,
      transferNonce?: null
    ): WithdrewEventFilter;
    Withdrew(
      transferId?: PromiseOrValue<BytesLike> | null,
      recipient?: PromiseOrValue<string> | null,
      amount?: null,
      transferNonce?: null
    ): WithdrewEventFilter;
  };

  estimateGas: {
    addBonder(
      bonder: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    bondWithdrawal(
      recipient: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      transferNonce: PromiseOrValue<BytesLike>,
      bonderFee: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getBondedWithdrawalAmount(
      bonder: PromiseOrValue<string>,
      transferId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getChainId(overrides?: CallOverrides): Promise<BigNumber>;

    getCredit(
      bonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getDebitAndAdditionalDebit(
      bonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getIsBonder(
      maybeBonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRawDebit(
      bonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTransferId(
      chainId: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      transferNonce: PromiseOrValue<BytesLike>,
      bonderFee: PromiseOrValue<BigNumberish>,
      amountOutMin: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTransferRoot(
      rootHash: PromiseOrValue<BytesLike>,
      totalAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTransferRootId(
      rootHash: PromiseOrValue<BytesLike>,
      totalAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isTransferIdSpent(
      transferId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    removeBonder(
      bonder: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    rescueTransferRoot(
      rootHash: PromiseOrValue<BytesLike>,
      originalAmount: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    settleBondedWithdrawal(
      bonder: PromiseOrValue<string>,
      transferId: PromiseOrValue<BytesLike>,
      rootHash: PromiseOrValue<BytesLike>,
      transferRootTotalAmount: PromiseOrValue<BigNumberish>,
      transferIdTreeIndex: PromiseOrValue<BigNumberish>,
      siblings: PromiseOrValue<BytesLike>[],
      totalLeaves: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    settleBondedWithdrawals(
      bonder: PromiseOrValue<string>,
      transferIds: PromiseOrValue<BytesLike>[],
      totalAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    stake(
      bonder: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    unstake(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdraw(
      recipient: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      transferNonce: PromiseOrValue<BytesLike>,
      bonderFee: PromiseOrValue<BigNumberish>,
      amountOutMin: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      rootHash: PromiseOrValue<BytesLike>,
      transferRootTotalAmount: PromiseOrValue<BigNumberish>,
      transferIdTreeIndex: PromiseOrValue<BigNumberish>,
      siblings: PromiseOrValue<BytesLike>[],
      totalLeaves: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addBonder(
      bonder: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    bondWithdrawal(
      recipient: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      transferNonce: PromiseOrValue<BytesLike>,
      bonderFee: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getBondedWithdrawalAmount(
      bonder: PromiseOrValue<string>,
      transferId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getChainId(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getCredit(
      bonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getDebitAndAdditionalDebit(
      bonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getIsBonder(
      maybeBonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getRawDebit(
      bonder: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTransferId(
      chainId: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      transferNonce: PromiseOrValue<BytesLike>,
      bonderFee: PromiseOrValue<BigNumberish>,
      amountOutMin: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTransferRoot(
      rootHash: PromiseOrValue<BytesLike>,
      totalAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTransferRootId(
      rootHash: PromiseOrValue<BytesLike>,
      totalAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isTransferIdSpent(
      transferId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    removeBonder(
      bonder: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    rescueTransferRoot(
      rootHash: PromiseOrValue<BytesLike>,
      originalAmount: PromiseOrValue<BigNumberish>,
      recipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    settleBondedWithdrawal(
      bonder: PromiseOrValue<string>,
      transferId: PromiseOrValue<BytesLike>,
      rootHash: PromiseOrValue<BytesLike>,
      transferRootTotalAmount: PromiseOrValue<BigNumberish>,
      transferIdTreeIndex: PromiseOrValue<BigNumberish>,
      siblings: PromiseOrValue<BytesLike>[],
      totalLeaves: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    settleBondedWithdrawals(
      bonder: PromiseOrValue<string>,
      transferIds: PromiseOrValue<BytesLike>[],
      totalAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    stake(
      bonder: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    unstake(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdraw(
      recipient: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      transferNonce: PromiseOrValue<BytesLike>,
      bonderFee: PromiseOrValue<BigNumberish>,
      amountOutMin: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      rootHash: PromiseOrValue<BytesLike>,
      transferRootTotalAmount: PromiseOrValue<BigNumberish>,
      transferIdTreeIndex: PromiseOrValue<BigNumberish>,
      siblings: PromiseOrValue<BytesLike>[],
      totalLeaves: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
