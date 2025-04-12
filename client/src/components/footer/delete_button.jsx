import { ReactComponent as CrossIcon } from "../icons/cross_icon.svg"
import "./Footer.css";

export const DeleteButton = () => {
    return (
      <button className="SearchBarButtons" style={{fontSize: "30px", }} onClick={() => alert('Button wurde geklickt!')}>
        <CrossIcon className="Icons"/>
      </button>
    );
  };