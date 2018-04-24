// documentのキーダウンイベント
document.onkeydown = (e) => {
    if (e.repeat) return false;
    addMessage(`down key is "${e.key}"[${e.keyCode}]`);
};

// documentのキーアップ
document.onkeyup = (e) => {
    addMessage(`up key is "${e.key}"[${e.keyCode}]`);
}

// メッセージ追加
function addMessage(message) {
    // p要素作成
    const p = document.createElement("p");
    // p要素にテキスト追加
    p.textContent = message;
    // メッセージ要素取得
    const messages = document.getElementById("messages");
    // メッセージ要素にp要素を追加
    messages.appendChild(p);
    // 一番下にスクロール
    messages.scrollTop = messages.scrollHeight;
}

class Game {
  constructor(screenID) {
    this._display = new ROT.Display();
    document.getElementById(screenID).appendChild(this._display.getContainer());
    this._display.drawText(0, 0, '%c{#0a0}hello rot js!%c{}');
    this._display.draw(3, 4, '@', 'olive');
  }
}

new Game("screen");
