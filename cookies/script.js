let bruh = document.getElementById('bruh');

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
        if (cookietext[i] == 'cookie1=') {
            bruh.innerHTML = cookietext[i+1];
            return;
        }
    }
}