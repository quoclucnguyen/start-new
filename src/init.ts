import {
  setDebug,
  themeParams,
  initData,
  viewport,
  init as initSDK,
  miniApp,
  backButton,
} from '@tma.js/sdk-react';

export async function init(options: { debug: boolean }): Promise<void> {
  setDebug(options.debug);
  initSDK();

  backButton.mount.ifAvailable();
  initData.restore();

  if (miniApp.mount.isAvailable()) {
    themeParams.mount();
    miniApp.mount();
    themeParams.bindCssVars();
  }

  if (viewport.mount.isAvailable()) {
    viewport.mount().then(() => {
      viewport.bindCssVars();
    });
  }
}
