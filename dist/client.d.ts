import { Explorer } from './explorer';
export declare class Client {
    explorer: Explorer;
    constructor(explorerUri?: string);
    /**
     * Transfer ERG or token, specifying the amount in nanoErgs or minimal token units.
     *
     * @param sk - secret key
     * @param recipient - address ot the transaction recipient
     * @param amountInt - amount to transfer in minimal units. Should be integer.
     * @param tokenId - id of a token to send. 'ERG' if  going to send ERG
     */
    transferInt(sk: string, recipient: string, amountInt: number, tokenId?: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * Transfer ERG or token.
     * Sent amount may be slightly different from the specified one due to JS float number representation.
     * For exact transfer us transferInt method.
     *
     * @param sk - secret key
     * @param recipient - address ot the transaction recipient
     * @param amount - amount to transfer
     * @param tokenId - id of a token to send. 'ERG' if  going to send ERG
     */
    transfer(sk: string, recipient: string, amount: number, tokenId?: string): Promise<import("axios").AxiosResponse<any>>;
    tokenIssue(sk: string, name: string, amount: number, decimals: number, description: string): Promise<import("axios").AxiosResponse<any>>;
    private ergTransfer;
    private tokenTransfer;
    private tokenDecimalsFactor;
}
