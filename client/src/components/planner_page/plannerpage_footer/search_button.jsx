import { ReactComponent as SearchIcon } from "../../icons/black/search_icon.svg"
import "./plannerpage_footer.css";

export const SearchButton = () => {
    return (
      <button className="PlannerpageFooter_SearchBarButtons" onClick={() => alert('Button wurde geklickt!')}>
        <SearchIcon className="Icons"/>
      </button>
    );
  };