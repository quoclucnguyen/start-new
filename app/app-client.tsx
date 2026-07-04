"use client";

import dynamic from "next/dynamic";

// The whole SPA is browser-only: TMA initData, the Supabase session, antd-mobile's
// custom renderer, and MemoryRouter all require `window`. There is no server session
// to render against, so SSR is disabled for the app entry by design.
const AppBootstrap = dynamic(() => import("./app-bootstrap"), { ssr: false });

export default function AppClient() {
  return <AppBootstrap />;
}
