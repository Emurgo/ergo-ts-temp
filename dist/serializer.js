"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Enc = require("@root/encoding/hex");
const flat = require("array.prototype.flat");
class Serializer {
    static outputToBytes(out, tokenIds) {
        let res = this.intToVlq(out.value);
        res = Buffer.concat([res, Buffer.from(out.ergoTree, 'hex')]);
        res = Buffer.concat([res, this.intToVlq(out.creationHeight)]);
        res = Buffer.concat([res, this.intToVlq(out.assets.length)]);
        for (const asset of out.assets) {
            const t = asset.tokenId;
            const n = tokenIds.indexOf(t);
            res = Buffer.concat([res, this.intToVlq(n)]);
            res = Buffer.concat([res, this.intToVlq(asset.amount)]);
        }
        const k = Object.keys(out.additionalRegisters).length;
        res = Buffer.concat([res, this.intToVlq(k)]);
        for (let i = 4; i < k + 4; i += 1) {
            res = Buffer.concat([res, Buffer.from(out.additionalRegisters['R' + i], 'hex')]);
        }
        return res;
    }
    static inputToBytes(input) {
        let res = Buffer.from(input.boxId, 'hex');
        const sp = input.spendingProof;
        res = Buffer.concat([res, this.intToVlq(sp.proofBytes.length >> 1)]);
        res = Buffer.concat([res, Buffer.from(sp.proofBytes, 'hex')]);
        res = Buffer.concat([res, this.intToVlq(Object.keys(sp.extension).length)]);
        Object.keys(sp.extension).forEach(k => {
            res += this.intToVlq(Number(k));
            res += this.valueSerialize(sp.extension[k]);
        });
        return res;
    }
    static transactionToBytes(tx) {
        let res = this.intToVlq(tx.inputs.length);
        Object.values(tx.inputs).forEach(input => {
            res = Buffer.concat([res, this.inputToBytes(input)]);
        });
        res = Buffer.concat([res, this.intToVlq(tx.dataInputs.length)]);
        tx.dataInputs.forEach(i => {
            res = Buffer.concat([res, Buffer.from(i.boxId, 'hex')]);
        });
        const distinctIds = this.distinctTokenList(tx.outputs);
        res = Buffer.concat([res, this.intToVlq(distinctIds.length)]);
        Object.values(distinctIds).forEach(v => {
            res = Buffer.concat([res, Buffer.from(v, 'hex')]);
        });
        res = Buffer.concat([res, this.intToVlq(tx.outputs.length)]);
        Object.values(tx.outputs).forEach(v => {
            res = Buffer.concat([res, this.outputToBytes(v, distinctIds)]);
        });
        return res;
    }
    static intToVlq(num) {
        let x = num;
        let res = Buffer.from([]);
        let r;
        while (parseInt(String(x / Math.pow(2, 7)), 10)) {
            r = x & 0x7f;
            x = parseInt(String(x / Math.pow(2, 7)), 10);
            res = Buffer.concat([res, Buffer.from([r | 0x80], null, 1)]);
        }
        r = x & 0x7f;
        res = Buffer.concat([res, Buffer.from([r], null, 1)]);
        return res;
    }
    static stringToHex(str) {
        return Enc.strToHex(str);
    }
    static stringFromHex(str) {
        return Enc.hexToStr(str);
    }
    // todo (?) merge with ErgoBox.extractAssets()
    static distinctTokenList(outputs) {
        // todo use flatMap after switching to es2019
        const flatTokenList = flat(outputs.map(output => output.assets.map(asset => asset.tokenId)));
        const seenTokens = new Set();
        const res = [];
        for (const currId of flatTokenList) {
            if (!seenTokens.has(currId)) {
                res.push(currId);
                seenTokens.add(currId);
            }
        }
        return res;
    }
    // todo ?
    static valueSerialize(v) {
        return Buffer.from([]);
    }
}
exports.Serializer = Serializer;
//# sourceMappingURL=serializer.js.map