const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    show: false,
    backgroundColor: '#f3fdf6',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // CRITICAL: Allows loading local index.html
      allowRunningInsecureContent: true
    },
  });

  // Path to the Vite build
  const indexPath = path.join(__dirname, 'dist', 'index.html');

  win.loadFile(indexPath).catch((err) => {
    console.error("Failed to load:", indexPath, err);
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  // Keep DevTools shortcut for debugging
  win.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      win.webContents.openDevTools();
      event.preventDefault();
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});