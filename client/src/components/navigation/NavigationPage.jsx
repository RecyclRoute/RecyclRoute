import "../footer/Footer.css";
import "../MapPage.css";
import { useState } from "react";
import { PlannerpageHeader } from "../planner_page/planner_page_header.jsx";
import { Footer } from "../footer/Footer.jsx";
import { NavigationMap } from "./Navigation_map_view.jsx";

export const NavigationPage = () => {




  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <PlannerpageHeader/>
    <div style={{ zIndex: 0, height: "100%" }}>
      <NavigationMap />
    </div>
    <Footer/>
    </div>
  );
};
