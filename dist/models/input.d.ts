import { SpendingProof } from './spending-proof';
export declare class Input {
    static formObject(obj: any): Input;
    outputTransactionId?: string;
    value?: number;
    address?: string;
    boxId: string;
    spendingProof: SpendingProof;
    constructor(boxId: string, spendingProof?: SpendingProof, address?: string, value?: number, outputTransactionId?: string);
}
