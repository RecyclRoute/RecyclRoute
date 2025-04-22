import { ReactComponent as CrossIcon } from "../../icons/black/cross_icon.svg"
import "./plannerpage_footer.css";

export const DeleteButton = () => {
    return (
      <button className="PlannerpageFooter_SearchBarButtons" style={{fontSize: "30px", }} onClick={() => alert('Button wurde geklickt!')}>
        <CrossIcon className="Icons"/>
      </button>
    );
  };