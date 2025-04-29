import "./navigationpage_footer.css";
import { ReactComponent as ArrowLeftIcon } from "../../../icons/black/arrow_left_icon.svg";
import { ReactComponent as ArrowRightIcon } from "../../../icons/black/arrow_right_icon.svg";

export const NavigationpageFooter = ({ handleNext, handlePrev }) => {
  return (
    <footer position="static" className="NavigationpageFooter">
      <div className="NavigationpageFooter_content" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2rem" }}>
        <button
          className="NavigationpageArrowButtons"
          onClick={handlePrev}
        >
          <ArrowLeftIcon style={{ width: "30px", height: "30px" }} />
        </button>
        <button
          className="NavigationpageArrowButtons"
          onClick={handleNext}
        >
          <ArrowRightIcon style={{ width: "30px", height: "30px" }} />
        </button>
      </div>
    </footer>
  );
};
