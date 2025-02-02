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
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common.js";

export interface OVM_L2_ERC20_BridgeInterface extends utils.Interface {
  functions: {
    "l1ERC20BridgeAddress()": FunctionFragment;
    "l2Messenger()": FunctionFragment;
    "withdraw(address,address,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "l1ERC20BridgeAddress" | "l2Messenger" | "withdraw"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "l1ERC20BridgeAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "l2Messenger",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "l1ERC20BridgeAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "l2Messenger",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {};
}

export interface OVM_L2_ERC20_Bridge extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: OVM_L2_ERC20_BridgeInterface;

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
    l1ERC20BridgeAddress(overrides?: CallOverrides): Promise<[string]>;

    l2Messenger(overrides?: CallOverrides): Promise<[string]>;

    withdraw(
      _l1TokenAddress: PromiseOrValue<string>,
      _l2TokenAddress: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  l1ERC20BridgeAddress(overrides?: CallOverrides): Promise<string>;

  l2Messenger(overrides?: CallOverrides): Promise<string>;

  withdraw(
    _l1TokenAddress: PromiseOrValue<string>,
    _l2TokenAddress: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    l1ERC20BridgeAddress(overrides?: CallOverrides): Promise<string>;

    l2Messenger(overrides?: CallOverrides): Promise<string>;

    withdraw(
      _l1TokenAddress: PromiseOrValue<string>,
      _l2TokenAddress: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    l1ERC20BridgeAddress(overrides?: CallOverrides): Promise<BigNumber>;

    l2Messenger(overrides?: CallOverrides): Promise<BigNumber>;

    withdraw(
      _l1TokenAddress: PromiseOrValue<string>,
      _l2TokenAddress: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    l1ERC20BridgeAddress(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    l2Messenger(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    withdraw(
      _l1TokenAddress: PromiseOrValue<string>,
      _l2TokenAddress: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
