// documentのキーダウンイベント
document.onkeydown = (e) => {
    if (e.repeat) return false;
    sendMessage(`down key is ${e.key}(${e.keyCode})`);
};

// documentのキーアップ
document.onkeyup = (e) => {
    sendMessage(`up key is ${e.key}(${e.keyCode})`);
}

// inputのキーダウンイベント
document.getElementById("input_line").onkeydown = (e) => {
    // Eventの伝搬を停止
    event.stopPropagation();
    // Enterキー以外は何もしない
    if (e.key !== "Enter") return;
    // input要素を取得
    const input_line = document.getElementById("input_line");
    // Enterキーが押されたら、内容を送信
    sendMessage(input_line.value);
    // inputボックスの中は空に
    input_line.value = "";
}

// inputのキーアップイベント
document.getElementById("input_line").onkeyup = (e) => {
    // Eventの伝搬を停止
    event.stopPropagation();
}

// メッセージ追加
function addMessage(message, color='black') {
    // p要素作成
    const p = document.createElement("p");
    // div要素にテキスト追加
    p.textContent = message;
    // 色を設定
    p.style.color = color;
    // メッセージ要素取得
    const messages = document.getElementById("messages");
    // メッセージ要素にdiv要素を追加
    messages.appendChild(p);
    // 一番下にスクロール
    messages.scrollTop = messages.scrollHeight;
}

// メッセージ送信
function sendMessage(message) {
    socket.emit('message', message);
}

// websocket接続
const socket = io();
socket.on('message', (message)=>{
    addMessage(message.message, message.color);
})
