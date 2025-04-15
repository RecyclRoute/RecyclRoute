import "../footer/Footer.css";
import "../MapPage.css";
import { useState } from "react";
import { Header } from "../Header.jsx";
import { Footer } from "../footer/Footer.jsx";
import { NavigationMap } from "./Navigation_map_view.jsx";

export const NavigationPage = () => {




  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header />
    <div style={{ zIndex: 0, height: "100%" }}>
      <NavigationMap />
    </div>
    <Footer/>
    </div>
  );
};
