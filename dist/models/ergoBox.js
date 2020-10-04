"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const serializer_1 = require("../serializer");
const address_1 = require("./address");
const input_1 = require("./input");
class ErgoBox {
    constructor(id, value, creationHeight, address, assets = [], additionalRegisters = {}) {
        this.assets = [];
        this.additionalRegisters = {};
        this.id = id;
        this.value = value;
        this.creationHeight = creationHeight;
        this.address = address;
        this.ergoTree = address.ergoTree;
        this.assets = assets;
        this.additionalRegisters = additionalRegisters;
    }
    static formObject(obj) {
        const id = obj.id || obj.boxId;
        let address;
        if (obj.address !== undefined) {
            address = new address_1.Address(obj.address);
        }
        else {
            address = address_1.Address.fromErgoTree(obj.ergoTree);
        }
        return new ErgoBox(id, obj.value, obj.creationHeight, address, obj.assets, obj.additionalRegisters);
    }
    static extractAssets(boxes) {
        const assetDict = {};
        for (const box of boxes) {
            for (const asset of box.assets) {
                const currAsset = asset;
                if (currAsset.tokenId in assetDict) {
                    assetDict[currAsset.tokenId] += currAsset.amount;
                }
                else {
                    assetDict[currAsset.tokenId] = currAsset.amount;
                }
            }
        }
        return Object.entries(assetDict).map(x => ({ tokenId: x[0], amount: Number(x[1]) }));
    }
    static encodeRegisters(obj) {
        const encoded = {};
        for (let i = 4; i <= 10; i += 1) {
            const reg = obj['R' + i];
            if (reg !== undefined) {
                const byteArray = serializer_1.Serializer.stringToHex(reg.toString());
                const b1 = Buffer.from([0x0e]);
                const b2 = Buffer.from(serializer_1.Serializer.intToVlq(byteArray.length / 2)).toString('hex');
                encoded['R' + i] = b1.toString('hex') + b2 + byteArray;
            }
        }
        return encoded;
    }
    static getSolvingBoxes(myBoxes, meaningfulOutputs, min = 15) {
        const ERGValue = meaningfulOutputs.reduce((sum, { value }) => sum + value, 0) + constants_1.feeValue;
        const assets = this.extractAssets(meaningfulOutputs);
        const remains = { ERG: ERGValue };
        assets.forEach(a => {
            remains[a.tokenId] = (remains[a.tokenId] || 0) + a.amount;
        });
        const boxesToSpend = [];
        const sortedBoxes = this.sort(myBoxes);
        for (const box of sortedBoxes) {
            boxesToSpend.push(box);
            if (remains.ERG > 0) {
                remains.ERG -= box.value;
            }
            box.assets.forEach(a => {
                if (remains[a.tokenId] > 0) {
                    remains[a.tokenId] -= a.amount;
                }
            });
            const positiveRemainingToken = Object.values(remains).find(o => o > 0);
            if (positiveRemainingToken === undefined) {
                if (boxesToSpend.length > min) {
                    return boxesToSpend;
                }
                else {
                    return boxesToSpend.concat(sortedBoxes.slice(boxesToSpend.length, min));
                }
            }
        }
        throw new Error(`Not enough solving boxes, remains: ${JSON.stringify(remains)}`);
    }
    static sort(boxes) {
        const sortableKeys = Object.keys(boxes).sort((a, b) => boxes[b].value - boxes[a].value);
        return sortableKeys.map(k => boxes[k]);
    }
    toInput() {
        return new input_1.Input(this.id);
    }
}
exports.ErgoBox = ErgoBox;
//# sourceMappingURL=ergoBox.js.map