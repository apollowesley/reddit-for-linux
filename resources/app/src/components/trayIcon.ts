import { app, Tray, Menu, ipcMain, nativeImage, BrowserWindow } from 'electron';

import {
  getAppIcon,
  getAppIconTray,
  getAppIconStatus,
  getCounterValue,
} from '../helpers/helpers';

export function createTrayIcon(
  nativefierOptions,
  mainWindow: BrowserWindow,
): Tray {
  const options = { ...nativefierOptions };

  if (options.tray) {
    const iconPath = getAppIconTray();
    const nimage = nativeImage.createFromPath(iconPath);
    const iconStatusPath = getAppIconStatus();
    const nimageStatus = nativeImage.createFromPath(iconStatusPath);
    const appIcon = new Tray(nimage);

    const onClick = () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    };

    const contextMenu = Menu.buildFromTemplate([
      {
        label: options.name,
        click: onClick,
      },
      {
        label: 'Quit',
        click: app.exit.bind(this),
      },
    ]);

    appIcon.on('click', onClick);

    if (options.counter) {
      mainWindow.on('page-title-updated', (e, title) => {
        const counterValue = getCounterValue(title);
        if (counterValue) {
          appIcon.setToolTip(`(${counterValue})  ${options.name}`);
          appIcon.setImage(nimageStatus);
        } else {
          appIcon.setToolTip(options.name);
          appIcon.setImage(nimage);
        }
      });
    } else {
      let counterValue = 0;
      ipcMain.on('notification', () => {
        if (mainWindow.isFocused()) {
          return;
        }
        appIcon.setToolTip(`•  ${options.name}`);
        appIcon.setImage(nimageStatus);
      });

      mainWindow.on('focus', () => {
        counterValue = 0;
        appIcon.setToolTip(options.name);
        appIcon.setImage(nimage);
      });
    }

    appIcon.setToolTip(options.name);
    appIcon.setContextMenu(contextMenu);

    return appIcon;
  }

  return null;
}
