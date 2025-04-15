import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { MapPage } from "./components/MapPage.jsx";
import { ErrorPage } from "./components/ErrorPage.jsx";
import { NavigationPage} from "./components/navigation//NavigationPage.jsx";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MapPage />} />
      <Route path="/navigation" element={<NavigationPage />} /> {/* <- NEU */}
      <Route path="/*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
