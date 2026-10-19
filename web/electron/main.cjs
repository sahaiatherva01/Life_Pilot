const { app, BrowserWindow, Tray, Menu, nativeImage, Notification, ipcMain } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;
let tray = null;
let isQuitting = false;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: '#0A0B0E',
    title: 'LifePilot',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // allow local file/asset access
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Intercept close event to keep app running in menu-bar tray
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  // Simple 16x16 monochrome canvas data URI for tray icon
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZElEQVQ4T2NkoBAwUqifYdQAHgaMBgNGgwGjwQAeA8aRkZGff/78+Q+Xf1H5jBgYGBikpKT+w/kxjEEXY1A0EBMT+w83ABmDXwwZgK4Y5hJ03w8ZALJgGBpGowE4g4yMjP6j4QEAzY4d/9/s2iIAAAAASUVORK5CYII='
  );

  tray = new Tray(icon);
  tray.setToolTip('LifePilot — AI Personal Life OS');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open LifePilot',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit LifePilot',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

// Background alarm poller to alert even when window is minimized or closed
function startBackgroundAlarmPoller() {
  setInterval(() => {
    const req = http.get('http://localhost:8000/api/reminders/active', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const alarms = JSON.parse(data);
          if (Array.isArray(alarms) && alarms.length > 0) {
            const firstAlarm = alarms[0];
            if (Notification.isSupported()) {
              const notif = new Notification({
                title: '⏰ LifePilot Scheduled Alert!',
                body: `${firstAlarm.task_title} (${firstAlarm.task_category}) is scheduled now.`,
                silent: false,
              });
              notif.on('click', () => {
                if (mainWindow) {
                  mainWindow.show();
                  mainWindow.focus();
                }
              });
              notif.show();
            }
          }
        } catch (e) {}
      });
    });
    req.on('error', () => {});
  }, 15000);
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  startBackgroundAlarmPoller();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  // Keep app active in menu-bar tray on macOS
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
