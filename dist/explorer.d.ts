import { AxiosInstance, AxiosResponse } from 'axios';
import { Address } from './models/address';
import { ErgoBox } from './models/ergoBox';
import { Transaction } from './models/transaction';
/**
 * Class to interact with explorer
 */
export declare class Explorer {
    static readonly testnet: Explorer;
    static readonly mainnet: Explorer;
    readonly apiClient: AxiosInstance;
    protected url: string;
    protected timeout: number;
    protected headers: {
        'Content-Type': string;
    };
    constructor(url: string);
    getCurrentHeight(): Promise<number>;
    getUnspentOutputs(address: Address): Promise<ErgoBox[]>;
    getUnconfirmed(address?: Address): Promise<Transaction[]>;
    getTransactions(address: Address): Promise<Transaction[]>;
    getTokenInfo(tokenId: string): Promise<ErgoBox>;
    broadcastTx(signedTransaction: Transaction): Promise<AxiosResponse<any>>;
    protected postRequest(url: string, data: any): Promise<AxiosResponse>;
    protected getRequest(url: string): Promise<AxiosResponse<any>>;
    private uniqueById;
}
