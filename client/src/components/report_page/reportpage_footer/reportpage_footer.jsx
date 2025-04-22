import "./reportpage_footer.css";
import { SearchButton } from "./search_button.jsx";
import { DeleteButton } from "./delete_button.jsx";
import { SearchBar } from "./search_bar.jsx";

export const ReportpageFooter = (props) => {



  return (
    <footer position= "static" className="footer">
        <div className="footer_content">
        <SearchButton/>
        <SearchBar/>
        <DeleteButton/>
        </div>
        {/*Button einfügen*/}
    </footer>
  );
};
