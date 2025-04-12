import "./Footer.css";
import { SearchButton } from "./search_button.jsx";
import { DeleteButton } from "./delete_button.jsx";
import { LoginButton } from "./login_button.jsx";
import { AppBar, Toolbar, Typography, Button, TextField } from "@mui/material";

export const Footer = (props) => {

  const setLoginOpen = props.setLoginOpen
  const startPageMode = props.startPageMode
  const setStartPageMode = props.setStartPageMode


  return (
    <footer position= "static" className="footer">
        <div className="footer_content">
        <SearchButton></SearchButton>
        <input id="SearchBar" type="text" placeholder="Suche (Ortschaft, Adressen)" />
        <DeleteButton></DeleteButton>
        
        </div>
        <LoginButton
          setLoginOpen={setLoginOpen}
          startPageMode={startPageMode}
          setStartPageMode={setStartPageMode}
          id="LoginButton"
        />
    </footer>
  );
};
