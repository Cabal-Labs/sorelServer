import { 
    privateToPublic, 
    bufferToHex, 
    ecsign, 
    toRpcSig, 
    keccakFromString 
} from 'ethereumjs-util';
import crypto from 'crypto';

function getRandomBytes(length) {
    return crypto.randomBytes(length);
}

function getCompressedPublicKey(publicKey) {
    const x = publicKey.slice(1, 33);
    const y = publicKey.slice(33, 65);
    const prefix = y[y.length - 1] % 2 === 0 ? '02' : '03';
    return prefix + x.toString('hex');
}

async function personalSign(message, privateKey) {
    const messageHash = keccakFromString(`\x19Ethereum Signed Message:\n${message.length}${message}`, 256);
    const signature = ecsign(messageHash, privateKey);
    return Buffer.from(toRpcSig(signature.v, signature.r, signature.s).slice(2), 'hex');
}

async function doubleSignMessageEth(aPrivKey, wPrivKey, message) {
    const _message = Buffer.from(message);
    const avatarPrivateKey = Buffer.from(aPrivKey, 'hex');
    const walletPrivateKey = Buffer.from(wPrivKey, 'hex');
    const avatarSignature = await personalSign(_message, avatarPrivateKey);
    const walletSignature = await personalSign(_message, walletPrivateKey);
    return [avatarSignature, walletSignature];
}

async function signMessageEth(aPrivKey, message){
    const _message = Buffer.from(message);
    const avatarPrivateKey = Buffer.from(aPrivKey, 'hex');
    const avatarSignature = await personalSign(_message, avatarPrivateKey);
    return avatarSignature;
}

function generateKeyPair() {
    const privateKey = getRandomBytes(32);
    const publicKeyFull = privateToPublic(privateKey);
    const publicKeyCompressed = getCompressedPublicKey(publicKeyFull);
    const privateKeyHex = bufferToHex(privateKey).slice(2);
    return {
        privateKey: privateKeyHex,
        publicKey: publicKeyCompressed
    };
}

export {
    generateKeyPair,
    signMessageEth,
    doubleSignMessageEth
};
