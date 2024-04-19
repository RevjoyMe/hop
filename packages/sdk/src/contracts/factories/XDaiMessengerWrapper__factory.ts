/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  XDaiMessengerWrapper,
  XDaiMessengerWrapperInterface,
} from "../XDaiMessengerWrapper.js";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_l1BridgeAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_l2BridgeAddress",
        type: "address",
      },
      {
        internalType: "contract IArbitraryMessageBridge",
        name: "_l1MessengerAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_l2ChainId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_defaultGasLimit",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_ambBridge",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ambBridge",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IL1Bridge",
        name: "l1Bridge",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "rootHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "totalAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "challengePeriod",
        type: "uint256",
      },
    ],
    name: "canConfirmRoot",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32[]",
        name: "rootHashes",
        type: "bytes32[]",
      },
      {
        internalType: "uint256[]",
        name: "destinationChainIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "totalAmounts",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "rootCommittedAts",
        type: "uint256[]",
      },
    ],
    name: "confirmRoots",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "defaultGasLimit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isRootConfirmation",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "l1BridgeAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "l1MessengerAddress",
    outputs: [
      {
        internalType: "contract IArbitraryMessageBridge",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "l2BridgeAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "l2ChainId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_calldata",
        type: "bytes",
      },
    ],
    name: "sendCrossDomainMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "l1BridgeCaller",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "verifySender",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class XDaiMessengerWrapper__factory {
  static readonly abi = _abi;
  static createInterface(): XDaiMessengerWrapperInterface {
    return new utils.Interface(_abi) as XDaiMessengerWrapperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): XDaiMessengerWrapper {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as XDaiMessengerWrapper;
  }
}
