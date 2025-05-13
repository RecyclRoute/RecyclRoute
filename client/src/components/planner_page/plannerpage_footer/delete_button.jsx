import { ReactComponent as CrossIcon } from "../../icons/black/cross_icon.svg"
import "./plannerpage_footer.css";

export const DeleteButton = (props) => {
  
  const deleteButtonClick = () => {
    props.setSearchLocation("");
  };

  return (
    <button
      className="PlannerpageFooter_SearchBarButtons"
      style={{fontSize: "30px", }}
      onClick={deleteButtonClick}
    >
      <CrossIcon className="Icons"/>
    </button>
  );
};