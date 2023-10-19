import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { 
    generateKeyPair, 
    signMessageEth,
    doubleSignMessageEth
} from './ethereumFunctions.js'; 

const app = express();


app.use(cors());


app.use(bodyParser.json());

app.get('/generate-key-pair', (req, res) => {
    const keyPair = generateKeyPair();
    res.json(keyPair);
});

app.post('/double-sign-message', async (req, res) => {
    if (!req.body.aPrivKey || !req.body.wPrivKey || !req.body.message) {
        return res.status(400).send('aPrivKey, wPrivKey, and message are required');
    }
    try {
        const signatures = await doubleSignMessageEth(req.body.aPrivKey, req.body.wPrivKey, req.body.message);
        res.json({
            avatarSignature: signatures[0].toString('hex'),
            walletSignature: signatures[1].toString('hex')
        });
    } catch (error) {
        res.status(500).send('Error signing message');
    }
});
app.post('/sign-message', async (req, res) => {
    if (!req.body.aPrivKey || !req.body.message) {
        return res.status(400).send('aPrivKey and message are required');
    }
    try {
        const signature = await signMessageEth(req.body.aPrivKey, req.body.message);
        res.json({
            avatarSignature: signature.toString('hex'),
        });
    } catch (error) {
        res.status(500).send('Error signing message');
    }
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
