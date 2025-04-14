import { ReactComponent as UserIcon } from "../icons/black/user_icon.svg"
import "./Footer.css"

export const LoginButton = (props) => {

  const LoginClick = () => {
    props.setLoginOpen(true);
    props.setStartPageMode(false);
  }
    return (
      <button id= "LoginButton" onClick={LoginClick}>
        <UserIcon className="Icons"/>
      </button>
    );
  };