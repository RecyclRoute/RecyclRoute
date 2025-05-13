import "../plannerpage.css";
import { useState } from "react";
import { NavigationpageFooter } from "./navigationpage_header_footer/navigationpage_footer.jsx";
import { NavigationpageHeader } from "./navigationpage_header_footer/navigationpage_header.jsx";
import { NavigationMap } from "./Navigation_map_view.jsx";
import { NavigationGuidePopup } from "./NavigationGuidePopup.jsx";

export const NavigationPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [routeLength, setRouteLength] = useState(0);
  const [calculationCompleted, setCalculationCompleted] = useState(false);
  const [userConfirmedRecalculation, setUserConfirmedRecalculation] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < routeLength - 1 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleRouteLength = (length) => {
    setRouteLength(length);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <NavigationpageHeader />
      <div style={{ zIndex: 0, height: "100%" }}>
        <NavigationMap currentIndex={currentIndex} onRouteLoad={handleRouteLength} />
      </div>
      <NavigationGuidePopup currentIndex={currentIndex} />
      <NavigationpageFooter handleNext={handleNext} handlePrev={handlePrev} />
    </div>
  );
};
