import { StartpageHeader } from "../start_page/startpage_header";
import { StartpageFooter } from "../start_page/startpage_footer";
import backgroundimage from "../icons/errorpage_karton.png";

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
            maxHeight: "70%",
            objectFit: "contain",
          }}
        />
      </div>

      <StartpageFooter />
    </div>
  );
};