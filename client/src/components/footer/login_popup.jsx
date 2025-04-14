import React, { useState, useEffect } from 'react';
import { MapSwissimage} from "../map/MapSwissimage.jsx";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ReactComponent as CrossIcon } from "../icons/black/cross_icon.svg"

export const LoginPopup = (props) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const closeLoginPopup = () => {
    props.setLoginOpen(false);
    props.setStartPageMode(true)};

    return (
      <div className="LoginOverlay">
        <div className="LoginContent">
          
          <div className="modal-header">
            <h2>Login</h2>
            <button className="close-button" onClick={closeLoginPopup}>
              <CrossIcon className="Icons"/>
            </button>
          </div>
  
          <div className="modal-body">
            <label htmlFor="username">Benutzername</label>
            <input
              id="username"
              type="text"
              placeholder="Benutzername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
  
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
  
          <div className="modal-footer">
            <button className="login-button">
              Anmelden
            </button>
          </div>
        </div>
      </div>
    );
};