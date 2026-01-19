import { emitEvent, isTMA, mockTelegramEnv } from '@tma.js/sdk-react';

if (import.meta.env.DEV) {
  if (!(await isTMA('complete'))) {
    const themeParams = {
      accent_text_color: '#13ec5b',
      bg_color: '#f6f8f6',
      button_color: '#13ec5b',
      button_text_color: '#0d1b12',
      destructive_text_color: '#e11d48',
      header_bg_color: '#ffffff',
      hint_color: '#4c9a66',
      link_color: '#13ec5b',
      secondary_bg_color: '#e7f3eb',
      section_bg_color: '#ffffff',
      section_header_text_color: '#0d1b12',
      subtitle_text_color: '#4c9a66',
      text_color: '#0d1b12',
    } as const;

    mockTelegramEnv({
      onEvent(e) {
        if (e.name === 'web_app_request_theme') {
          return emitEvent('theme_changed', { theme_params: themeParams });
        }
        if (e.name === 'web_app_request_viewport') {
          return emitEvent('viewport_changed', {
            height: window.innerHeight,
            width: window.innerWidth,
            is_expanded: true,
            is_state_stable: true,
          });
        }
      },
      launchParams: new URLSearchParams([
        ['tgWebAppThemeParams', JSON.stringify(themeParams)],
        [
          'tgWebAppData',
          new URLSearchParams([
            ['auth_date', ((new Date().getTime() / 1000) | 0).toString()],
            ['hash', 'dev-hash'],
            ['signature', 'dev-signature'],
            ['user', JSON.stringify({ id: 1, first_name: 'Dev User', username: 'devuser' })],
          ]).toString(),
        ],
        ['tgWebAppVersion', '8.4'],
        ['tgWebAppPlatform', 'tdesktop'],
      ]),
    });

    console.info('⚠️ TMA environment mocked for development');
  }
}
