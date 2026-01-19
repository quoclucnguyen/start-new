import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { unstableSetRender } from 'antd-mobile'
import { retrieveLaunchParams } from '@tma.js/sdk-react'
import './index.css'
import App from './App.tsx'
import { init } from '@/init.ts'

// Import mock environment for development
import './mockEnv.ts'

// React 19 compatibility for antd-mobile v5
// See: https://mobile.ant.design/guide/v5-for-19/
unstableSetRender((node, container) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (container as any)._reactRoot ||= createRoot(container);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const root = (container as any)._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});

try {
  const launchParams = retrieveLaunchParams();
  const debug =
    (launchParams.tgWebAppStartParam || '').includes('debug') ||
    import.meta.env.DEV;

  await init({ debug }).then(() =>
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  );
} catch (e) {
  console.error('Failed to initialize TMA:', e);
  // Fallback: render app without TMA initialization
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
