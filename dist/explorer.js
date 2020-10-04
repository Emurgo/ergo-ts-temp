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
const axios_1 = require("axios");
const ergoBox_1 = require("./models/ergoBox");
const transaction_1 = require("./models/transaction");
/**
 * Class to interact with explorer
 */
class Explorer {
    constructor(url) {
        this.timeout = 1000 * 5;
        this.headers = {
            'Content-Type': 'application/json',
        };
        this.url = url;
        this.apiClient = axios_1.default.create({
            baseURL: url,
            headers: this.headers,
            timeout: this.timeout,
        });
        this.apiClient.interceptors.response.use(response => Promise.resolve(response), error => Promise.reject(new Error(error.response || {})));
    }
    getCurrentHeight() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data: { items }, } = yield this.getRequest(`/blocks?limit=1`);
            return items[0].height;
        });
    }
    getUnspentOutputs(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.getRequest(`/transactions/boxes/byAddress/unspent/${address.address}`);
            return this.uniqueById(data.map(o => ergoBox_1.ErgoBox.formObject(o)));
        });
    }
    getUnconfirmed(address) {
        return __awaiter(this, void 0, void 0, function* () {
            let data;
            if (address === undefined) {
                data = (yield this.getRequest(`/transactions/unconfirmed`)).data;
            }
            else {
                data = (yield this.getRequest(`/transactions/unconfirmed/byAddress/${address.address}`)).data;
            }
            return this.uniqueById(data.map(o => transaction_1.Transaction.formObject(o)));
        });
    }
    getTransactions(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.getRequest(`/addresses/${address.address}/transactions`);
            return data.items.map(o => transaction_1.Transaction.formObject(o));
        });
    }
    getTokenInfo(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.getRequest(`/transactions/boxes/${tokenId}`);
            const { data: { outputs }, } = yield this.getRequest(`/transactions/${data.spentTransactionId}`);
            const parsedOutputs = outputs.map(o => ergoBox_1.ErgoBox.formObject(o));
            return parsedOutputs.find(o => o.assets.find(a => a.tokenId === tokenId) !== undefined);
        });
    }
    broadcastTx(signedTransaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.postRequest('/transactions/send', signedTransaction);
        });
    }
    postRequest(url, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.apiClient({
                data: data,
                method: 'POST',
                url: url,
            });
        });
    }
    getRequest(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.apiClient({
                method: 'GET',
                url,
            });
        });
    }
    uniqueById(elements) {
        const uniqueBoxes = [];
        elements.forEach(b => {
            if (uniqueBoxes.find(x => x.id === b.id) === undefined) {
                uniqueBoxes.push(b);
            }
        });
        return uniqueBoxes;
    }
}
exports.Explorer = Explorer;
Explorer.testnet = new Explorer('https://api-testnet.ergoplatform.com');
Explorer.mainnet = new Explorer('https://new-explorer.ergoplatform.com');
//# sourceMappingURL=explorer.js.map