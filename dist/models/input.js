"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spending_proof_1 = require("./spending-proof");
class Input {
    constructor(boxId, spendingProof = spending_proof_1.SpendingProof.empty, address, value, outputTransactionId) {
        this.boxId = boxId;
        this.spendingProof = spendingProof;
        this.address = address;
        this.value = value;
        this.outputTransactionId = outputTransactionId;
    }
    static formObject(obj) {
        const id = obj.id || obj.boxId;
        const proofBytes = obj.spendingProof.proofBytes !== undefined ? obj.spendingProof.proofBytes : obj.spendingProof;
        return new Input(id, new spending_proof_1.SpendingProof(proofBytes), obj.address, obj.value, obj.outputTransactionId);
    }
}
exports.Input = Input;
//# sourceMappingURL=input.js.map