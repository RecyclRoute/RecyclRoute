import "./reportpage_header.css";
import { Link } from "react-router-dom";

export const ReportpageHeader = () => {


  return (
<header className="Header">
  <div>
    <div id="HeaderTitle">
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        RecyclRoute
      </Link>{" "}
      - Report
    </div>
  </div>
</header>

  );
};
