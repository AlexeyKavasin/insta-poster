import * as dotenv from 'dotenv';
import { IgApiClient } from 'instagram-private-api';
import express from 'express';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const ig = new IgApiClient();

app.use(express.json());

ig.state.generateDevice(process.env.IG_USERNAME);

const postPhoto = async (file) => {
    if (file && file.length) {
        // optional
        await ig.simulate.preLoginFlow();
        // login
        await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
        // Optionally wrap it to process.nextTick so we dont need to wait ending of this bunch of requests
        process.nextTick(async () => await ig.simulate.postLoginFlow());
        // publish
        const publishResult = await ig.publish.photo({
            // read the file into a Buffer
            file: file,
            // optional, default ''
            caption: 'This photo is uploaded by a bot',
        });

        console.log('result: ', publishResult);
    }
};

app.get('/', (req, res) => {
    res.send('(◠﹏◠)');
})

app.post('/upload', async (req, res) => {
    const imgSrc = req && req.body && req.body.src;

    if (imgSrc && imgSrc.includes('data:image')) {
        const preparedSrc = req.body.src.replace(/^data:image\/jpeg;base64,/, '');
        const file = Buffer.from(preparedSrc, 'base64');
        
        postPhoto(file);
    }
})

app.listen(port, () => {
  console.log(`App is up and listening at port:${port}`);
});
