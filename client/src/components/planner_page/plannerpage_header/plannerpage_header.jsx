import "./plannerpage_header.css";
import { Link } from "react-router-dom";

export const PlannerpageHeader = (props) => {


  return (
    <header className="PlannerpageHeader" position="static">
  <div>
    <div id="HeaderTitle">
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        RecyclRoute
      </Link>{" "}
      - Planner
    </div>
  </div>
    </header>
  );
};
