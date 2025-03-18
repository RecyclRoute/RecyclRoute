import { NavLink } from "react-router";

function NavButton({ path, children }) {
  return (
    <NavLink
      to={path}
      style={({ isActive }) => ({
        display: "inline-block",
        margin: ".5em 1em",
        color: isActive ? "dodgerblue" : "black",
      })}
    >
      {children}
    </NavLink>
  );
}

function Header() {
  return (
    <>
      <h1>
        4230 Webmapping Beispiele mit
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src="./react.svg" className="logo" alt="React logo" />
        </a>
        React
      </h1>
      <h2>
        <NavButton path="openlayers">
          <img src="./OpenLayers_logo.svg" className="logo" alt="OpenLayers logo" />
          OpenLayers
        </NavButton>
      </h2>
    </>
  );
}
export default Header;
