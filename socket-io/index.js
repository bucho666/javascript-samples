// expressをrequire
const express = require('express');
// expressでappを作成
const app = express();
// appでlistenし、http.serverを取得
const http = app.listen(8000);
// http.serverでserver socketを作成
const io = require('socket.io')(http);
// publicフォルダを公開
app.use(express.static('public'));
// serversocketの接続イベントを定義
io.on('connection', (socket)=>{
    // 接続通知
    console.log(`[${socket.id}] connected`);
    // socket以外の全員に通知
    socket.broadcast.emit('message', {
        'message': `[${socket.id}] connected`,
        'color': 'olive'
    });

    // ユーザ切断イベント定義
    socket.on('disconnect', ()=>{
        console.log(`[${socket.id}] disconnected`);
        // socket以外の全員に送信
        socket.broadcast.emit('message', {
            'message': `[${socket.id}] disconnected`,
            'color': 'red'
        });
    });

    // ユーザ定義イベント(message)を定義
    socket.on('message', (message)=>{
        console.log(`[${socket.id}] ${message}`);
        // socket以外の全員に送信
        socket.broadcast.emit('message', {
            'message': `[${socket.id}] ${message}`,
            'color':'green'}
        );
        // socketにだけ送信
        socket.emit('message', {
            'message': message,
            'color':'black'}
        );
    });
});
