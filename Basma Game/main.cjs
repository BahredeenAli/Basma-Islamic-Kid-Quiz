const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    show: false, // Don't show until the page is loaded to prevent white flicker
    backgroundColor: '#f3fdf6', // Matches your game background
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Build the path to the index.html file
  // Using path.join with separate arguments is safest for Windows
  const indexPath = path.join(__dirname, 'dist', 'index.html');

  // Load the local file
  win.loadFile(indexPath).catch((err) => {
    console.error("Critical: Failed to load index.html from path:", indexPath);
    console.error(err);
  });

  // Open DevTools automatically for debugging (you can remove this later)
  // win.webContents.openDevTools();

  // Show the window only when the content is ready
  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  // Enable a shortcut to open DevTools even in production (Ctrl+Shift+I)
  win.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      win.webContents.openDevTools();
      event.preventDefault();
    }
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});