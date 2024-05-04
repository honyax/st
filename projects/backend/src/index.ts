import express from 'express';
import path from 'path';

const port = 3000;
const app = express();
app.use(express.json());

// フロントエンドをルーティング
// フロントエンドモジュールが存在しない場合はエラー(500)を表示
app.use(express.static(path.resolve(__dirname, '../../frontend/dist')));
app.use(express.static(path.resolve(__dirname, '../../frontend/public')));

app.post('/api/hello', (req, res) => {
    res.json({ message: 'Hello World!' });
});

// サーバ起動
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
