import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { PortfolioPage } from "./components/PortfolioPage";
import { CloudPage } from "./pages/CloudPage";
import { EdcSetupPage } from "./pages/EdcSetupPage";
import { WindowsSetupPage } from "./pages/WindowsSetupPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { NowPlayingAdminPage } from "./pages/NowPlayingAdminPage";
import { useMagicCursor } from "./components/useMagicCursor";

const AppLayout: React.FC = () => {
  useMagicCursor();

  return (
    <>
      <div
        className="pointer-events-none magic-cursor-bw-layer"
        id="magic-cursor-bw-layer"
        aria-hidden="true"
      />
      <div className="pointer-events-none magic-cursor" id="magic-cursor">
      </div>
      <div id="magic-cursor-text" className="magic-cursor-text"></div>
      <Outlet />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<PortfolioPage />} />
        <Route path="/cloud" element={<CloudPage />} />
        <Route path="/edc-setup" element={<EdcSetupPage />} />
        <Route path="/windows" element={<WindowsSetupPage />} />
        <Route path="/_now-playing" element={<NowPlayingAdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
