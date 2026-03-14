import React from "react";
import { Routes, Route } from "react-router-dom";
import { PortfolioPage } from "./components/PortfolioPage";
import { CloudPage } from "./pages/CloudPage";
import { EdcSetupPage } from "./pages/EdcSetupPage";
import { WindowsSetupPage } from "./pages/WindowsSetupPage";
import { CloudPrivacyPage } from "./pages/CloudPrivacyPage";
import { GravatarPage } from "./pages/GravatarPage";
import { IconsCategoriesPage } from "./pages/IconsCategoriesPage";
import { IconsMacPage } from "./pages/IconsMacPage";
import { IconsWindowsPage } from "./pages/IconsWindowsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PortfolioPage />} />
      <Route path="/cloud" element={<CloudPage />} />
      <Route path="/edc-setup" element={<EdcSetupPage />} />
      <Route path="/windows" element={<WindowsSetupPage />} />
      <Route path="/cloud-privacy" element={<CloudPrivacyPage />} />
      <Route path="/gravatar" element={<GravatarPage />} />
      <Route path="/icons/categories" element={<IconsCategoriesPage />} />
      <Route path="/icons/macos" element={<IconsMacPage />} />
      <Route path="/icons/windows" element={<IconsWindowsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;


