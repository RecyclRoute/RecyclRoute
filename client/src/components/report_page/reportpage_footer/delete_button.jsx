import { ReactComponent as CrossIcon } from "../../icons/black/cross_icon.svg"

import "./reportpage_footer.css";

export const DeleteButton = (props) => {

  const deleteButtonClick = () => {
    props.setSearchLocation("");
  };

    return (
      <button
      className="SearchBarButtons"
      style={{fontSize: "30px", }}
      onClick={deleteButtonClick}
      >
        <CrossIcon className="Icons"/>
      </button>
    );
  };