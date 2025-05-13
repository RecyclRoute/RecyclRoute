import { ReactComponent as SearchIcon } from "../../icons/black/search_icon.svg"
import "./reportpage_footer.css";

export const SearchButton = (props) => {
    return (
      <button
        className="SearchBarButtons"
        onClick={props.searchLocationClick}
      >
        <SearchIcon className="Icons"/>
      </button>
    );
  };