import "./startpage_header.css";
import { Link } from "react-router-dom";

export const StartpageHeader = () => {


  return (
    <header className="header" position="static">
      <div>
        <div id="HeaderTitle">
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  RecyclRoute
                </Link>{" "}
        </div>
      </div>
    </header>
  );
};



