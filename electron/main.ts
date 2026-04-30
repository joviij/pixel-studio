import path from 'node:path';
import fs from 'node:fs/promises';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { closeDb, getProject, listProjects, saveProject } from './db';
import type { SaveProjectInput } from './types';

const PIXEL_COUNT = 32 * 32;

function validatePixelGrid(pixels: unknown): pixels is string[] {
  if (!Array.isArray(pixels) || pixels.length !== PIXEL_COUNT) {
    return false;
  }

  return pixels.every((value) => typeof value === 'string');
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
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

  ipcMain.handle('projects:save', (_event, input: SaveProjectInput) => {
    if (!input || typeof input.name !== 'string' || input.name.trim().length === 0) {
      throw new Error('Project name is required.');
    }

    if (!validatePixelGrid(input.pixels)) {
      throw new Error('Pixel grid must be an array of 1024 color strings.');
    }

    const normalized: SaveProjectInput = {
      id: typeof input.id === 'number' ? input.id : undefined,
      name: input.name.trim(),
      pixels: input.pixels
    };

    return saveProject(normalized);
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
