import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { unstableSetRender } from 'antd-mobile'
import './index.css'
import App from './App.tsx'

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
