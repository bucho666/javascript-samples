// expressをrequire
const express = require("express");
// appを作成
const app = express();
// 静的フォルダを設定
app.use(express.static("public"));
// (サイトアドレス)/helloでアクセスした際の挙動を定義
app.get("/hello", (req, res) => {
  res.send("hello world");
});
// port3000でlisten開始
const PORT = 3000;
app.listen(PORT, () => {
  // listen完了した際の挙動
  console.log(`Example app listening on port ${PORT}`);
});
