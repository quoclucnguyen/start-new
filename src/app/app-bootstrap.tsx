"use client";

import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { unstableSetRender } from "antd-mobile";
import { retrieveLaunchParams } from "@tma.js/sdk-react";
import App from "@/App";
import { init } from "@/init";
// Dev-only mock of the Telegram WebView environment (side-effect import).
import "@/mockEnv";

// React 19 compatibility for antd-mobile v5.
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

export default function AppBootstrap() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const launchParams = retrieveLaunchParams();
        const debug =
          (launchParams.tgWebAppStartParam || "").includes("debug") ||
          process.env.NODE_ENV !== "production";
        await init({ debug });
      } catch (e) {
        // Fallback: render the app without TMA initialization (e.g. plain browser).
        console.error("Failed to initialize TMA:", e);
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;
  return <App />;
}
