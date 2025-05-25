const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
loadFile: () => ipcRenderer.invoke("load-file"),
saveFile: (content) => ipcRenderer.invoke("save-file", content),
});