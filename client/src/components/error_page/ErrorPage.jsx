import { Routes, Route } from "react-router-dom";
import { StartpageHeader } from "../start_page/startpage_header";
import { StartpageFooter } from "../start_page/startpage_footer";
import backgroundimage from "../icons/karton.png";
import { AutoFitText } from "./AutoFitText";

export const ErrorPage = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <StartpageHeader />

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "auto",
        }}
      >
        <img
          src={backgroundimage}
          style={{
            maxWidth: "98%",
            objectFit: "contain",
          }}
        />
        <AutoFitText
          text="ERROR 404 – THIS SITE DOES NOT EXIST"
          maxFontSize={60}
        />
      </div>

      <StartpageFooter />
    </div>
  );
};