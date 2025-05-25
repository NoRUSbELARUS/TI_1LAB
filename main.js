const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs");

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 750,
    webPreferences: {
      preload: __dirname + "/preload.js",
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile("index.html");
});

ipcMain.handle("load-file", async () => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Text Files", extensions: ["txt"] }],
  });

  if (filePaths.length === 0) return ""; 

  return fs.promises.readFile(filePaths[0], "utf-8");
});

ipcMain.handle("save-file", async (_, content) => {
  const { filePath } = await dialog.showSaveDialog({
    filters: [{ name: "Text Files", extensions: ["txt"] }],
  });

  if (!filePath) return;

  return fs.promises.writeFile(filePath, content, "utf-8");
});