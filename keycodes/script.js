window.onkeydown = function (e) {
    let key = e.keyCode ? e.keyCode : e.which;
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('code').innerHTML = key;
}
