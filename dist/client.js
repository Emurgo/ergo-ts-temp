"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const explorer_1 = require("./explorer");
const address_1 = require("./models/address");
const ergoBox_1 = require("./models/ergoBox");
const transaction_1 = require("./models/transaction");
const serializer_1 = require("./serializer");
class Client {
    constructor(explorerUri = 'https://new-explorer.ergoplatform.com') {
        this.explorer = new explorer_1.Explorer(explorerUri);
    }
    /**
     * Transfer ERG or token, specifying the amount in nanoErgs or minimal token units.
     *
     * @param sk - secret key
     * @param recipient - address ot the transaction recipient
     * @param amountInt - amount to transfer in minimal units. Should be integer.
     * @param tokenId - id of a token to send. 'ERG' if  going to send ERG
     */
    transferInt(sk, recipient, amountInt, tokenId = 'ERG') {
        return __awaiter(this, void 0, void 0, function* () {
            if (tokenId === 'ERG') {
                return this.ergTransfer(recipient, amountInt, sk);
            }
            else {
                return this.tokenTransfer(recipient, tokenId, amountInt, sk);
            }
        });
    }
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
    transfer(sk, recipient, amount, tokenId = 'ERG') {
        return __awaiter(this, void 0, void 0, function* () {
            let factor = constants_1.unitsInOneErgo;
            if (tokenId !== 'ERG') {
                factor = yield this.tokenDecimalsFactor(tokenId);
            }
            return this.transferInt(sk, recipient, amount * factor, tokenId);
        });
    }
    tokenIssue(sk, name, amount, decimals, description) {
        return __awaiter(this, void 0, void 0, function* () {
            const amountInt = amount * Math.pow(10, decimals);
            const height = yield this.explorer.getCurrentHeight();
            const sender = address_1.Address.fromSk(sk);
            const myBoxes = yield this.explorer.getUnspentOutputs(sender);
            const basePayloadOuts = [new ergoBox_1.ErgoBox('', constants_1.feeValue, height - constants_1.heightDelta, sender)];
            const boxesToSpend = ergoBox_1.ErgoBox.getSolvingBoxes(myBoxes, basePayloadOuts);
            const token = {
                amount: amountInt,
                tokenId: boxesToSpend[0].id,
            };
            // Reminder: serializedByteArrayInRegister = '\x0e' + intToVlq(bytearray.length) + byteArray
            const registers = ergoBox_1.ErgoBox.encodeRegisters({
                R4: name,
                R5: description,
                R6: decimals,
            });
            const payloadOutsWithTokens = [new ergoBox_1.ErgoBox('', constants_1.minBoxValue, height - constants_1.heightDelta, sender, [token], registers)];
            const unsignedTx = transaction_1.Transaction.fromOutputs(boxesToSpend, payloadOutsWithTokens);
            const signedTx = unsignedTx.sign(sk);
            return yield this.explorer.broadcastTx(signedTx);
        });
    }
    ergTransfer(recipient, amountInt, sk) {
        return __awaiter(this, void 0, void 0, function* () {
            const height = yield this.explorer.getCurrentHeight();
            const myBoxes = yield this.explorer.getUnspentOutputs(address_1.Address.fromSk(sk));
            const payloadOuts = [new ergoBox_1.ErgoBox('', amountInt, height - constants_1.heightDelta, new address_1.Address(recipient))];
            const boxesToSpend = ergoBox_1.ErgoBox.getSolvingBoxes(myBoxes, payloadOuts);
            const unsignedTx = transaction_1.Transaction.fromOutputs(boxesToSpend, payloadOuts);
            const signedTx = unsignedTx.sign(sk);
            return yield this.explorer.broadcastTx(signedTx);
        });
    }
    tokenTransfer(recipient, tokenId, amountInt, sk) {
        return __awaiter(this, void 0, void 0, function* () {
            const height = yield this.explorer.getCurrentHeight();
            const tokens = [
                {
                    amount: amountInt,
                    tokenId,
                },
            ];
            const payloadOuts = [new ergoBox_1.ErgoBox('', constants_1.minBoxValue, height - constants_1.heightDelta, new address_1.Address(recipient), tokens)];
            const myBoxes = yield this.explorer.getUnspentOutputs(address_1.Address.fromSk(sk));
            const boxesToSpend = ergoBox_1.ErgoBox.getSolvingBoxes(myBoxes, payloadOuts);
            const unsignedTx = transaction_1.Transaction.fromOutputs(boxesToSpend, payloadOuts);
            const signedTx = unsignedTx.sign(sk);
            return yield this.explorer.broadcastTx(signedTx);
        });
    }
    tokenDecimalsFactor(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenInfo = yield this.explorer.getTokenInfo(tokenId);
            const r6 = 'R6';
            const R6 = tokenInfo.additionalRegisters[r6];
            const decimals = Number(serializer_1.Serializer.stringFromHex(R6.slice(4, R6.length)));
            return Math.pow(10, decimals);
        });
    }
}
exports.Client = Client;
//# sourceMappingURL=client.js.map