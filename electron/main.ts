import path from 'node:path';
import fs from 'node:fs/promises';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { closeDb, deleteProject, getProject, listProjects, saveProject } from './db';
import { parseSaveProjectInput } from './project-adapter';

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1300,
    height: 900,
    minWidth: 900,
    minHeight: 640,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    win.loadURL(devUrl);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  ipcMain.handle('projects:list', () => {
    return listProjects();
  });

  ipcMain.handle('projects:get', (_event, id: number) => {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid project id.');
    }

    return getProject(id);
  });

  ipcMain.handle('projects:save', (_event, input: unknown) => {
    const normalized = parseSaveProjectInput(input);
    if (!normalized) {
      throw new Error('Project payload is invalid.');
    }

    return saveProject(normalized);
  });

  ipcMain.handle('projects:delete', (_event, id: number) => {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid project id.');
    }

    return deleteProject(id);
  });

  ipcMain.handle('dialog:savePng', async () => {
    const focused = BrowserWindow.getFocusedWindow();
    const result = focused
      ? await dialog.showSaveDialog(focused, {
          title: 'Export PNG',
          defaultPath: 'pixel-art.png',
          filters: [{ name: 'PNG Image', extensions: ['png'] }]
        })
      : await dialog.showSaveDialog({
          title: 'Export PNG',
          defaultPath: 'pixel-art.png',
          filters: [{ name: 'PNG Image', extensions: ['png'] }]
        });

    if (result.canceled || !result.filePath) {
      return null;
    }

    return result.filePath;
  });

  ipcMain.handle('files:writePng', async (_event, filePath: string, bytes: Uint8Array) => {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Missing export path.');
    }

    await fs.writeFile(filePath, Buffer.from(bytes));
    return true;
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  closeDb();
});
