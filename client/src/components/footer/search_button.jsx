import { ReactComponent as SearchIcon } from "../icons/search_icon.svg"
import "./Footer.css";

export const SearchButton = () => {
    return (
      <button className="SearchBarButtons" onClick={() => alert('Button wurde geklickt!')}>
        <SearchIcon className="Icons"/>
      </button>
    );
  };