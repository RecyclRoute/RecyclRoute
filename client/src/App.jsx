import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { MapPage } from "./components/MapPage.jsx";
import { ErrorPage } from "./components/ErrorPage.jsx";
import "./App.css";

function App() {
  
  
  return (
    <Routes>

      <Route
        id="Startpage"
        path="/"
        element={
          <MapPage
          />}
        />
      <Route
        path="/*"
        element={
          <ErrorPage/>
        }
      />
    </Routes>
    
  );
}

export default App;
