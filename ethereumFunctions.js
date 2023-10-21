import { 
    privateToPublic, 
    bufferToHex, 
    ecsign, 
    toRpcSig, 
    keccakFromString 
} from 'ethereumjs-util';
import crypto from 'crypto';
import secp256k1  from 'secp256k1';





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
    let privateKey;
    do {
        privateKey = crypto.randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privateKey));

    const publicKey = secp256k1.publicKeyCreate(privateKey, true); 

    return {
        privateKey: privateKey.toString('hex'),
        publicKey: Buffer.from(publicKey).toString('hex')   
    };
}


export {
    generateKeyPair,
    signMessageEth,
    doubleSignMessageEth
};
