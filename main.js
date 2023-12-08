const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 830,
    height: 677,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  //mainWindow.webContents.openDevTools();

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript('require = null');
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});