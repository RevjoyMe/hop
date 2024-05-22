import { TokenSymbol } from '../types.js'

// Return a type predicate
// https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
export function isValidTokenSymbol(symbol: TokenSymbol | string): symbol is TokenSymbol {
  return Object.values(TokenSymbol).includes(symbol as TokenSymbol)
}
