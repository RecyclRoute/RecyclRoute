import "./plannerpage_footer.css";
import { useEffect } from "react";
import { SearchButton } from "./search_button.jsx";
import { DeleteButton } from "./delete_button.jsx";
import { SearchBar } from "./search_bar.jsx";
import { ProjectManagerButton } from "../project_manager/ProjectManagerButton.jsx";

export const PlannerpageFooter = (props) => {

  useEffect(() => {
    fetch("http://localhost:8000/getProjects")
      .then(res => res.json())
      .then(data => {
        console.log("FETCH RESPONSE:", data);
        if (Array.isArray(data.projects)) {
          props.setProjects(data.projects);
        } else {
          console.error("Ungültiges Projektformat:", data);
        }
      });
  }
);

  return (
    <footer position= "static" className="PlannerpageFooter">
        <div className="PlannerpageFooter_content">
        <SearchButton
          searchLocationClick={props.searchLocationClick}
        />
        <SearchBar
          SearchLocation={props.SearchLocation}
          setSearchLocation={props.setSearchLocation}
        />
        <DeleteButton
          SearchLocation={props.SearchLocation}
          setSearchLocation={props.setSearchLocation}
        />
        </div>
          <ProjectManagerButton
            startPageMode={props.startPageMode}
            setStartPageMode={props.setStartPageMode}
            ProjectManagerMode={props.ProjectManagerMode}
            setProjectManagerMode={props.setProjectManagerMode}
            useloadProjects={props.useloadProjects}
            isLoading={props.isLoading}
            setIsLoading={props.setIsLoading}
            projects={props.projects}
            setProjects={props.setProjects}
          />
    </footer>
  );
};
