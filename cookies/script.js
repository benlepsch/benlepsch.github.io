let bruh = document.getElementById('bruh');

window.onload = refresh();

function update() {
    let text = prompt('put somethig');
    updateCookie(text);
}

function updateCookie(txt) {
    document.cookie = 'cookie1=' + txt + ';';
}

function refresh() {
    let cookietext = document.cookie.split(';');
    for (let i = 0; i < cookietext.length; i++) {
        if (cookietext[i].slice(0,8) == 'cookie1=') {
            bruh.innerHTML = cookietext[i].slice(8,cookietext[i].length);
            return;
        } else if (cookietext[i].slice(0, 9) == ' cookie1=') {
            bruh.innerHTML = cookietext[i].slice(9, cookietext[i].length);
            return;
        }
    }
}