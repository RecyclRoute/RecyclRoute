import "./reportpage_header.css";
import { Link } from "react-router-dom";
import recyclroute_logo from "../../icons/RecyclRoute_Logo_9E9E9E.png";

export const ReportpageHeader = () => {


  return (
<header className="Header">
  <div>
  <div style={{
          flex: 1,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          position: "relative",
          overflow: "auto"
  }}>
    <div id="HeaderTitle" style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center"}}>
      <Link
        to="/"
        style={{
          textDecoration: 'none',
          color: 'inherit',
          flex: 1,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          position: "relative",
          overflow: "auto",
          marginRight: "5px"
        }}
      >
        <img src={recyclroute_logo} style={{maxHeight: "50px", marginRight: "5px"}}></img>
        RecyclRoute
      </Link>
      <div style={{marginRight: "5px"}}>{" - "}</div>
      <div>{"Report"}</div>
    </div>
  </div>
  </div>
</header>

  );
};
