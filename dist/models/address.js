"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blake = require("blakejs");
const bs58 = require("bs58");
const ec = require("elliptic");
const { curve } = ec.ec('secp256k1');
var Network;
(function (Network) {
    Network[Network["Mainnet"] = 0] = "Mainnet";
    Network[Network["Testnet"] = 16] = "Testnet";
})(Network = exports.Network || (exports.Network = {}));
;
var AddressKind;
(function (AddressKind) {
    AddressKind[AddressKind["P2PK"] = 1] = "P2PK";
    AddressKind[AddressKind["P2SH"] = 2] = "P2SH";
    AddressKind[AddressKind["P2S"] = 3] = "P2S";
})(AddressKind = exports.AddressKind || (exports.AddressKind = {}));
;
class Address {
    constructor(address) {
        this.address = address;
        this.addrBytes = bs58.decode(this.address);
    }
    get publicKey() {
        return this.addrBytes.slice(1, 34);
    }
    get ergoTree() {
        if (this.getType() === AddressKind.P2PK) {
            return Buffer.concat([Buffer.from([0x00, 0x08, 0xcd]), this.publicKey]).toString('hex');
        }
        else {
            return this.addrBytes.slice(1, this.addrBytes.length - 4).toString('hex');
        }
    }
    static fromErgoTree(ergoTree, network = Network.Mainnet) {
        if (ergoTree.startsWith('0008cd')) {
            const prefixByte = Buffer.from([network + AddressKind.P2PK]);
            const pk = ergoTree.slice(6, 72);
            const contentBytes = Buffer.from(pk, 'hex');
            const checksum = Buffer.from(blake.blake2b(Buffer.concat([prefixByte, contentBytes]), null, 32), 'hex');
            const address = Buffer.concat([prefixByte, contentBytes, checksum]).slice(0, 38);
            return new Address(bs58.encode(address));
        }
        else {
            const prefixByte = Buffer.from([network + AddressKind.P2S]);
            const contentBytes = Buffer.from(ergoTree, 'hex');
            const hash = blake.blake2b(Buffer.concat([prefixByte, contentBytes]), null, 32);
            const checksum = Buffer.from(hash, 'hex').slice(0, 4);
            const address = Buffer.concat([prefixByte, contentBytes, checksum]);
            return new Address(bs58.encode(address));
        }
    }
    static fromPk(pk, network = Network.Mainnet) {
        const prefixByte = Buffer.from([network + AddressKind.P2PK]);
        const contentBytes = Buffer.from(pk, 'hex');
        const checksum = Buffer.from(blake.blake2b(Buffer.concat([prefixByte, contentBytes]), null, 32), 'hex');
        const address = Buffer.concat([prefixByte, contentBytes, checksum]).slice(0, 38);
        return new Address(bs58.encode(address));
    }
    static fromSk(sk, network = Network.Mainnet) {
        const pk = Buffer.from(curve.g.mul(sk).encodeCompressed());
        return this.fromPk(pk, network);
    }
    static fromBase58(address) {
        const addr = new Address(address);
        if (!addr.isValid()) {
            throw new Error(`Invalid Ergo address ${address}`);
        }
        return addr;
    }
    static fromBytes(bytes) {
        const address = bs58.encode(bytes);
        return Address.fromBase58(address);
    }
    isValid() {
        const size = this.addrBytes.length;
        const script = this.addrBytes.slice(0, size - 4);
        const checksum = this.addrBytes.slice(size - 4, size);
        const calculatedChecksum = Buffer.from(blake.blake2b(script, null, 32), 'hex').slice(0, 4);
        return calculatedChecksum.toString('hex') === checksum.toString('hex');
    }
    getNetwork() {
        return this.headByte() & 0xF0;
    }
    getType() {
        return this.headByte() & 0xF;
    }
    headByte() {
        return this.addrBytes[0];
    }
}
exports.Address = Address;
//# sourceMappingURL=address.js.map