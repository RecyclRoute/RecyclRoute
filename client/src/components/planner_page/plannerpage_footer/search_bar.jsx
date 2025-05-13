import "./plannerpage_footer.css";

export const SearchBar = (props) => {
  return (
    <input
      id="PlannerpageFooter_SearchBar"
      type="text"
      placeholder="Suche (Ortschaft, Adressen)"
      value={props.SearchLocation}
      onChange={(e) => props.setSearchLocation(e.target.value)}
    />
  );
};