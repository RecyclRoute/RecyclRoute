import "./reportpage_footer.css";
import { useState, useEffect } from "react";
import { SearchButton } from "./search_button.jsx";
import { DeleteButton } from "./delete_button.jsx";
import { SearchBar } from "./search_bar.jsx";
import { AddMarkerButton } from "../add_marker/add_marker_button.jsx";
import useCreateMarker from "../../map/useCreateMarker";

export const ReportpageFooter = (props) => {



  return (
    <footer position= "static" className="footer">
        <div className="footer_content">
        <SearchButton/>
        <SearchBar/>
        <DeleteButton/>
        </div>
        <AddMarkerButton
                      markerMode={props.markerMode}
                      setMarkerMode={props.setMarkerMode}
                      setAddMarkerOpen={props.setAddMarkerOpen}
                      startPageMode={props.startPageMode}
                      setStartPageMode={props.setStartPageMode}
                      useCreateMarker={props.useCreateMarker}/>
    </footer>
    
  );
};
