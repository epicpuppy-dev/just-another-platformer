const { app, BrowserWindow } = require('electron');
const path = require('path');

window.addEventListener('DOMContentLoaded', () => {
function LaunchGame() {
    document.getElementById('game').innerHTML = "hello";
    const win = new BrowserWindow({
        width: 1200,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'quit.js')
        },
        frame: false
    });
    win.loadFile('game.html');
    win.removeMenu();
}

function LaunchEditor() {
    const win = new BrowserWindow({
        width: 1200,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'quit.js')
        }
    });
    win.loadFile('editor.html');
    win.setMenu(null);
}

function Quit() {
    app.quit();
}
});