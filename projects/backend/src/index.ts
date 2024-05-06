import express from 'express';
import path from 'path';
import * as data from './data';

const port = 3000;
const app = express();
app.use(express.json());

// フロントエンドをルーティング
// dist 以下がビルドされた JavaScript ファイル、public 以下が静的ファイル
app.use(express.static(path.resolve(__dirname, '../../frontend/dist')));
app.use(express.static(path.resolve(__dirname, '../../frontend/public')));

app.post('/api/hello', (req, res) => {
    res.json({ message: 'Hello World!' });
});

// サーバ起動
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});

async function main() {
    const csvFilePath = '../data/EdinetcodeDlInfoUTF8.csv';
    data.Data.readCompanyData(csvFilePath);
}

main();
