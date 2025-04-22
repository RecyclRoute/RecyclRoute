import { Routes, Route } from "react-router-dom";
// import ".../App.css";
import { StartpageHeader } from "../start_page/startpage_header";
import { StartpageFooter } from "../start_page/startpage_footer"; 

export const ErrorPage = () => {
  return (
    
<div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
<StartpageHeader />
  <div style={{ backgroundColor: "F5F5F5", height: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
    <h3>ERROR 404 - THIS SITE DOES NOT EXIST</h3>
  </div>
<StartpageFooter/>
</div>
  );
};