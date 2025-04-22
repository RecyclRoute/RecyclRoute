import { ReactComponent as SearchIcon } from "../../icons/black/search_icon.svg"
import "./reportpage_footer.css";

export const SearchButton = () => {
    return (
      <button className="SearchBarButtons" onClick={() => alert('Button wurde geklickt!')}>
        <SearchIcon className="Icons"/>
      </button>
    );
  };