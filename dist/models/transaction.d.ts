import { ErgoBox } from './ergoBox';
import { IIdObject } from './IIdObject';
import { Input } from './input';
export declare class Transaction implements IIdObject {
    /**
     *
     * @param boxesToSpend - boxes to spend
     * @param payloadOutputs - outputs without fee and change
     * @param fee - fee to pay
     */
    static fromOutputs(boxesToSpend: ErgoBox[], payloadOutputs: ErgoBox[], fee?: number): Transaction;
    static formObject(obj: any): Transaction;
    private static createFee;
    private static createChangeOutputs;
    inputs: Input[];
    dataInputs: Input[];
    outputs: ErgoBox[];
    timestamp?: number;
    confirmations?: number;
    headerId?: string;
    id?: string;
    constructor(inputs: Input[], outputs: ErgoBox[], dataInputs?: Input[], id?: string, timestamp?: number, headerId?: string, confirmationsCount?: number);
    sign(sk: string): Transaction;
}
