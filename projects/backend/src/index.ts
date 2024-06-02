import express from 'express';
import path from 'path';
import * as data from './data';
import * as mysql from './mysql';

const port = 3000;
const app = express();
app.use(express.json());

const m = new mysql.MySQL('localhost', 'stock_tracker', 'stock_tracker', 'stock_tracker');

const csvFilePath = '../data/EdinetcodeDlInfoUTF8.csv';

// フロントエンドをルーティング
// dist 以下がビルドされた JavaScript ファイル、public 以下が静的ファイル
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
const frontendPublicPath = path.resolve(__dirname, '../../frontend/public');
app.use(express.static(frontendDistPath));
app.use(express.static(frontendPublicPath));

app.post('/api/hello', (req, res) => {
    res.json({ message: 'Hello World!' });
});

// サーバ起動
const server = app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

// サーバ停止処理
async function gracefulShutdown() {
    console.log('Shutting down gracefully...');
    await m.disconnect();
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
}
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('uncaughtException', (err) => {
    console.error(err);
    gracefulShutdown();
});

async function main() {
    await m.connect();
    await data.createCompaniesFromCsvToDatabase(csvFilePath, m);
}

main();
