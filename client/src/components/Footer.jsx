import "./Footer.css";
import { SearchButton } from "./footer_components/search_button.jsx";
import { DeleteButton } from "./footer_components/delete_button.jsx";
import { LoginButton } from "./footer_components/login_button.jsx";
import { AppBar, Toolbar, Typography, Button, TextField } from "@mui/material";

export const Footer = (props) => {


  return (
    <footer position= "static" className="footer">
        <div className="searchbar">
        <SearchButton></SearchButton>
        <input type="text" placeholder="Suche" />
        <DeleteButton></DeleteButton>
        </div>
        <LoginButton id="LoginButton"></LoginButton>
    </footer>
  );
};
