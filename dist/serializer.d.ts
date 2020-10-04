import { ErgoBox } from './models/ergoBox';
import { Input } from './models/input';
import { Transaction } from './models/transaction';
export declare class Serializer {
    static outputToBytes(out: ErgoBox, tokenIds: any): string;
    static inputToBytes(input: Input): any;
    static transactionToBytes(tx: Transaction): string;
    static intToVlq(num: number): string;
    static stringToHex(str: string): any;
    static stringFromHex(str: string): any;
    protected static distinctTokenList(outputs: ErgoBox[]): string[];
    protected static valueSerialize(v: string): any;
}
