import "./plannerpage_footer.css";
import { SearchButton } from "./search_button.jsx";
import { DeleteButton } from "./delete_button.jsx";
import { SearchBar } from "./search_bar.jsx";

export const PlannerpageFooter = (props) => {



  return (
    <footer position= "static" className="PlannerpageFooter">
        <div className="PlannerpageFooter_content">
        <SearchButton/>
        <SearchBar/>
        <DeleteButton/>
        </div>
          {/*Button einfügen*/}
    </footer>
  );
};
