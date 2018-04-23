window.addEventListener("keydown", function (e) {
    var code = e.keyCode;
    var div = document.createElement("div");
    var messages = document.getElementById("messages");
    div[(div.innerText == undefined)?"textContent":"innerText"] = `pressed key is "${String.fromCharCode(code)}"[${code}]`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
});

