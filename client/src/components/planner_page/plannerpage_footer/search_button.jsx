import { ReactComponent as SearchIcon } from "../../icons/black/search_icon.svg"
import "./plannerpage_footer.css";

export const SearchButton = (props) => {
    return (
      <button
        className="PlannerpageFooter_SearchBarButtons"
        onClick={props.searchLocationClick}
      >
        <SearchIcon className="Icons"/>
      </button>
    );
  };