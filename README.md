# ♻️ RecyclRoute

**RecyclRoute** ist ein GIS-basiertes Webportal zur Planung und Optimierung von Sammelrouten für Papier- und Kartonabfälle. Das Projekt wurde im Rahmen des Moduls 4230 entwickelt und kombiniert moderne Webtechnologien mit Geodateninfrastruktur-Komponenten, um eine effiziente und benutzerfreundliche Lösung für die Abfallwirtschaft bereitzustellen.

## 🌐 Projektübersicht

- **Frontend**: React.js, OpenLayers
- **Backend**: FastAPI, GeoServer
- **Deployment**: GitHub Pages

## 🚀 Live-Demo

Erlebe die Anwendung in Aktion: [GDI_Project auf GitHub Pages](https://314a.github.io/GDI_Project/)

## 🛠️ Voraussetzungen

Stelle sicher, dass folgende Tools auf deinem System installiert sind:

- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/) oder eine andere IDE
- [Anaconda](https://www.anaconda.com/)
- [Node.js und npm](https://nodejs.org/)
- [Docker] (https://docs.docker.com/desktop/setup/install/windows-install/)

## 📦 Installation

### Repository klonen

```bash
cd / #(Pfad zu deinem Verzeichnis)
git clone https://github.com/RecyclRoute/RecyclRoute.git
```

### Frontend einrichten

```bash
cd RecyclRoute/client
npm install
npm start
```

### Backend einrichten

```bash
cd ../server
conda config --add channels conda-forge
conda create --name recyclroute-venv python=3.11.7 --file app/requirements.txt
conda activate recyclroute-venv
```

## 🧪 Getestete Versionen

- Node.js: 22.14.0
- OpenLayers: 9.1.0
- Maplibre: 5.1.0
- React: 18.3.1
-

## 📁 Projektstruktur

```
RecyclRoute/
├── client/        # Frontend-Anwendung
├── server/        # Backend-Anwendung
│   └── app/       # FastAPI-Anwendung
├── README.md      # Projektbeschreibung
└── ...
```

## 🤝 Mitwirken

Beiträge sind herzlich willkommen! Bitte beachte die [CONTRIBUTING.md](CONTRIBUTING.md) für weitere Informationen.

## 📄 Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).

---

## Virtualenv aufestzen

python -m venv myenv311

.\myenv311\Scripts\activate

pip install -r requirements.txt
