/// <reference types="node" />
export declare enum Network {
    Mainnet = 0,
    Testnet = 16
}
export declare enum AddressKind {
    P2PK = 1,
    P2SH = 2,
    P2S = 3
}
export declare class Address {
    get publicKey(): Buffer;
    get ergoTree(): string;
    static fromErgoTree(ergoTree: string, network?: Network): Address;
    static fromPk(pk: string, network?: Network): Address;
    static fromSk(sk: string, network?: Network): Address;
    address: string;
    addrBytes: Buffer;
    constructor(address: string);
    static fromBase58(address: string): Address;
    static fromBytes(bytes: Buffer): Address;
    isValid(): boolean;
    getNetwork(): Network;
    getType(): AddressKind;
    private headByte;
}
