import { app, BrowserWindow, ipcMain } from 'electron'

import path from 'path';
import fs from 'fs';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
    
const __dirname = dirname(fileURLToPath(import.meta.url));


const createWindow = () =>{
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile('./src/index.html')
}

app.whenReady().then(() =>{
  createWindow();
})


app.on('window-all-closed', () =>{
  if(process.platform !== 'darwin') app.quit();
})