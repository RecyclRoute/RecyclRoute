import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { StartPage } from "./components/start_page/StartPage.jsx";
import { MapPage } from "./components/MapPage.jsx";
import { ErrorPage } from "./components/error_page/ErrorPage.jsx";
import { NavigationPage} from "./components/navigation//NavigationPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/"  element={<StartPage />}/>
      <Route path="/report"></Route>
      <Route path="/planner" element={<MapPage />}></Route>
      <Route path="/navigation" element={<NavigationPage />} />
      <Route path="/*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
