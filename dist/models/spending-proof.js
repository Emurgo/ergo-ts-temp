"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpendingProof {
    constructor(proofBytes, extension = {}) {
        this.proofBytes = proofBytes;
        this.extension = extension;
    }
}
exports.SpendingProof = SpendingProof;
SpendingProof.empty = new SpendingProof('', {});
//# sourceMappingURL=spending-proof.js.map