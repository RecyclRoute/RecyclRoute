import lupeIcon from "./icon-lupe.svg"

export const SearchButton = () => {
    return (
      <button onClick={() => alert('Button wurde geklickt!')}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
           xmlns="./icon-lupe.svg" style={{ verticalAlign: "middle", marginRight: "0px" }}>
        <path d="M11.742 10.344h-.79l-.28-.27a6.471 6.471 0 001.57-4.243C11.242 3.33 9.147 1.25 6.618 1.25S2 3.33 2 6.368s2.095 5.118 4.624 5.118a6.471 6.471 0 004.242-1.57l.27.28v.79l4.251 4.251c.39.39.39 1.024 0 1.414a1.001 1.001 0 01-1.414 0L11.742 10.344z" fill="#000"/>
      </svg>
             
      </button>
    );
  };