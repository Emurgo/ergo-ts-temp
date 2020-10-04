"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const constants_1 = require("../constants");
const ergoSchnorr_1 = require("../ergoSchnorr");
const serializer_1 = require("../serializer");
const ergoBox_1 = require("./ergoBox");
const input_1 = require("./input");
const spending_proof_1 = require("./spending-proof");
class Transaction {
    constructor(inputs, outputs, dataInputs = [], id, timestamp, headerId, confirmationsCount) {
        this.inputs = inputs;
        this.dataInputs = dataInputs;
        this.outputs = outputs;
        this.id = id;
        this.timestamp = timestamp;
        this.confirmations = confirmationsCount;
        this.headerId = headerId;
    }
    /**
     *
     * @param boxesToSpend - boxes to spend
     * @param payloadOutputs - outputs without fee and change
     * @param fee - fee to pay
     */
    static fromOutputs(boxesToSpend, payloadOutputs, fee = constants_1.feeValue) {
        let outputs = payloadOutputs;
        const height = payloadOutputs[0].creationHeight;
        const feeBox = this.createFee(payloadOutputs, height, fee);
        outputs = outputs.concat(feeBox);
        const realChangeAddress = boxesToSpend[0].address;
        const changeOuts = this.createChangeOutputs(boxesToSpend, outputs, realChangeAddress, height);
        outputs = outputs.concat(changeOuts);
        return new Transaction(boxesToSpend.map(b => b.toInput()), outputs, []);
    }
    static formObject(obj) {
        const inputs = obj.inputs.map(i => input_1.Input.formObject(i));
        const dataInputs = obj.dataInputs === undefined ? [] : obj.dataInputs.map(i => new input_1.Input(i.boxId));
        const outputs = obj.outputs.map(i => ergoBox_1.ErgoBox.formObject(i));
        return new Transaction(inputs, outputs, dataInputs, obj.id, obj.timestamp, obj.headerId, obj.confirmationsCount);
    }
    static createFee(payloadOutputs, height, fee) {
        if (payloadOutputs.find(o => (o.address.address === constants_1.feeMainnetAddress.address || o.address.address === constants_1.feeTestnetAddress.address))) {
            return [];
        }
        else {
            return [new ergoBox_1.ErgoBox('', fee, height, constants_1.feeMainnetAddress)];
        }
    }
    static createChangeOutputs(boxesToSpend, restOutputs, changeAddress, height) {
        const totalValueIn = boxesToSpend.reduce((sum, { value }) => sum + value, 0);
        const totalValueOut = restOutputs.reduce((sum, { value }) => sum + value, 0);
        const outputs = [];
        const assetsIn = ergoBox_1.ErgoBox.extractAssets(boxesToSpend);
        const assetsMap = {};
        assetsIn.forEach(a => {
            assetsMap[a.tokenId] = (assetsMap[a.tokenId] || 0) + a.amount;
        });
        ergoBox_1.ErgoBox.extractAssets(restOutputs).forEach(a => {
            if (a.tokenId !== boxesToSpend[0].id) {
                assetsMap[a.tokenId] -= a.amount;
            }
        });
        const changeAssets = [];
        Object.keys(assetsMap).forEach(k => {
            if (assetsMap[k] > 0) {
                changeAssets.push({ tokenId: k, amount: assetsMap[k] });
            }
        });
        const changeAmount = totalValueIn - totalValueOut;
        if (changeAmount > constants_1.minBoxValue) {
            outputs.push(new ergoBox_1.ErgoBox('', changeAmount, height, changeAddress, changeAssets, {}));
        }
        else if (changeAmount !== 0 || assetsIn.length > 0) {
            throw new Error('Insufficient funds');
        }
        return outputs;
    }
    sign(sk) {
        const serializeTransaction = serializer_1.Serializer.transactionToBytes(this);
        const signedInputs = this.inputs.map(input => {
            const proofBytes = ergoSchnorr_1.sign(serializeTransaction, new BN(sk, 16));
            const sp = new spending_proof_1.SpendingProof(proofBytes.toString('hex'));
            return new input_1.Input(input.boxId, sp);
        });
        return new Transaction(signedInputs, this.outputs, this.dataInputs);
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.js.map