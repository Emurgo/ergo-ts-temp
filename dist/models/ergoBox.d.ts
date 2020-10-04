import { Address } from './address';
import { Input } from './input';
import { ITokens } from './ITokens';
export declare class ErgoBox {
    static formObject(obj: any): ErgoBox;
    static extractAssets(boxes: ErgoBox[]): ITokens[];
    static encodeRegisters(obj: any): {};
    static getSolvingBoxes(myBoxes: ErgoBox[], meaningfulOutputs: ErgoBox[], min?: number): ErgoBox[];
    static sort(boxes: any): any[];
    id: string;
    value: number;
    creationHeight: number;
    address: Address;
    ergoTree: string;
    assets: any[];
    additionalRegisters: {};
    constructor(id: string, value: number, creationHeight: number, address: Address, assets?: any[], additionalRegisters?: {});
    toInput(): Input;
}
