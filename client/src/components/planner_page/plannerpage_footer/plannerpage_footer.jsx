import "./plannerpage_footer.css";
import { SearchButton } from "./search_button.jsx";
import { DeleteButton } from "./delete_button.jsx";
import { SearchBar } from "./search_bar.jsx";
import { ProjectManagerButton } from "../project_manager/ProjectManagerButton.jsx";

export const PlannerpageFooter = (props) => {



  return (
    <footer position= "static" className="PlannerpageFooter">
        <div className="PlannerpageFooter_content">
        <SearchButton/>
        <SearchBar/>
        <DeleteButton/>
        </div>
          <ProjectManagerButton
            startPageMode={props.startPageMode}
            setStartPageMode={props.setStartPageMode}
            ProjectManagerMode={props.ProjectManagerMode}
            setProjectManagerMode={props.setProjectManagerMode}
          />
    </footer>
  );
};
