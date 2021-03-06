// documentのキーダウンイベント
document.onkeydown = (e) => {
    if (e.repeat) return false;
    addMessage(`down key is "${e.key}"[${e.keyCode}]`);
};

// documentのキーアップ
document.onkeyup = (e) => {
    addMessage(`up key is "${e.key}"[${e.keyCode}]`);
}

// inputのキーダウンイベント
document.getElementById("input_line").onkeydown = (e) => {
    // Eventの伝搬を停止
    event.stopPropagation();
    // Enterキー以外は何もしない
    if (e.key !== "Enter") return;
    // input要素を取得
    const input_line = document.getElementById("input_line");
    // Enterキーが押されたら、内容をメッセージボックスに
    addMessage(input_line.value);
    // inputボックスの中は空に
    input_line.value = "";
}

// inputのキーアップイベント
document.getElementById("input_line").onkeyup = (e) => {
    // Eventの伝搬を停止
    event.stopPropagation();
}

// メッセージ追加
function addMessage(message) {
    // div要素作成
    const div = document.createElement("div");
    // div要素にテキスト追加
    div["textContent"] = message;
    // メッセージ要素取得
    const messages = document.getElementById("messages");
    // メッセージ要素にdiv要素を追加
    messages.appendChild(div);
    // 一番下にスクロール
    messages.scrollTop = messages.scrollHeight;
}
