export declare class SpendingProof {
    static readonly empty: SpendingProof;
    proofBytes: string;
    extension: Record<string, any>;
    constructor(proofBytes: string, extension?: Record<string, any>);
}
