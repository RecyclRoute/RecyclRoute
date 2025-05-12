import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { StartPage } from "./components/start_page/StartPage.jsx";
import { PlannerPage } from "./components/planner_page/plannerpage.jsx";
import { ErrorPage } from "./components/error_page/ErrorPage.jsx";
import { NavigationPage } from "./components/planner_page/navigation/navigationpage.jsx";
import { ReportPage } from "./components/report_page/reportpage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/"  element={<StartPage />}/>
      <Route path="/planner" element={<PlannerPage/>}></Route>
      <Route path="/navigation" element={<NavigationPage/>}/>
      <Route path="/report" element={<ReportPage/>}/>
      <Route path="/*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
