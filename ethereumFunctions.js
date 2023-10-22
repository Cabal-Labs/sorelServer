import { 
    privateToPublic, 
    bufferToHex, 
    ecsign, 
    toRpcSig, 
    keccakFromString 
} from 'ethereumjs-util';
import crypto from 'crypto';
import secp256k1  from 'secp256k1';
import { Wallet, getDefaultProvider } from "ethers";
import 'dotenv/config'

const privateKey = process.env.PRIVATE_KEY
const sorelTable = process.env.SOREL_TABLE
const interactions = process.env.INTERACTIONS
const archiveT = process.env.ARCHIVE



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

async function writeLikesData(user_Id, post_id, liked, likes_table_index){
    const urlProvider = process.env.URLPROVIDER
    const wallet = new Wallet(privateKey);
    const provider = getDefaultProvider(urlProvider);
    const signer = wallet.connect(provider);
    const db = new Database({ signer });
    const { meta: insert1 } = await db
    .prepare(`INSERT INTO ${sorelTable} (user_id, likes_table) VALUES (?, ?);`)
    .bind(user_Id, likes_table_index)
    .run();
    await insert1.txn?.wait();

    const { meta: insert2 } = await db
    .prepare(`INSERT INTO ${interactions} (post_id, likes_table,liked) VALUES (?, ?, ?);`)
    .bind(post_id, likes_table_index,liked )
    .run();
    await insert2.txn?.wait();

}

async function writeTwitterArchive(user_id, _archive){
    const urlProvider = process.env.URLPROVIDER
    const wallet = new Wallet(privateKey);
    const provider = getDefaultProvider(urlProvider);
    const signer = wallet.connect(provider);
    const db = new Database({ signer });

    const { meta: insert } = await db
    .prepare(`INSERT INTO ${archiveT} (user_id, archive) VALUES (?, ?);`)
    .bind(user_id,_archive )
    .run();
    await insert.txn?.wait();


    
}


export {
    generateKeyPair,
    signMessageEth,
    doubleSignMessageEth,
    writeLikesData,
    writeTwitterArchive

};
