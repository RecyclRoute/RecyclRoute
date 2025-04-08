import { Routes, Route } from "react-router-dom";
import "../App.css";
import { Header } from "./Header";

export const ErrorPage = () => {
  return (
    
    <div className="PageWrapper">
            <div>
        <Header />
      </div>
      <h1>ERROR THIS SITE IS NOT FOUND</h1>
    </div>
  );
};