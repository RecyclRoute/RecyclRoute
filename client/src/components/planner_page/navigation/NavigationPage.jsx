import "../plannerpage.css";
import { useState } from "react";
import { PlannerpageHeader } from "../plannerpage_header/plannerpage_header.jsx";
import { PlannerpageFooter } from "../plannerpage_footer/plannerpage_footer.jsx";
import { NavigationMap } from "./Navigation_map_view.jsx";
import { BaseMap } from "../../map/BaseMap.jsx";

export const NavigationPage = () => {




  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <PlannerpageHeader/>
    <div style={{ zIndex: 0, height: "100%" }}>
      <NavigationMap />
    </div>
    <PlannerpageFooter/>
    </div>
  );
};
