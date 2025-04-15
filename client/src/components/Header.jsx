import "./Header.css";
import { AppBar, Toolbar, Typography, Grid } from "@mui/material";

export const Header = (props) => {


  return (
    <header className="App-header" position="static">
      <div>
        <div id="HeaderTitle">
          RecyclRoute - Planner
        </div>
        <div id="HeaderUsername"></div>
      </div>
    </header>
  );
};
