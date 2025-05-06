# ♻️ RecyclRoute

**RecyclRoute** ist ein GIS-basiertes Webportal zur Planung und Optimierung von Sammelrouten für Papier- und Kartonabfälle. Das Projekt wurde im Rahmen des Moduls 4230 an der FHNW in Muttenz entwickelt und kombiniert  Webtechnologien mit Geodateninfrastruktur-Komponenten, um eine effiziente und benutzerfreundliche Lösung für die Abfallwirtschaft bereitzustellen.

## 🌐 Projektübersicht

- **Frontend**: React.js, OpenLayers
- **Backend**: FastAPI, GeoServer
- **Deployment**: GitHub Pages

## 🚀 Live-Demo

Erlebe die Anwendung in Aktion: [GDI_Project auf GitHub Pages](https://314a.github.io/GDI_Project/)

## 🛠️ Voraussetzungen

Stelle sicher, dass folgende Tools auf deinem System installiert sind:

- [Git](https://git-scm.com/)
- [Python 3.11.7] (https://www.python.org/downloads/release/python-3117/)
- [Visual Studio Code](https://code.visualstudio.com/) oder eine andere IDE
- [Anaconda](https://www.anaconda.com/)
- [Node.js und npm](https://nodejs.org/)
- [Docker] (https://docs.docker.com/desktop/setup/install/windows-install/)
- [pgAdmin4]

## 📦 Installation

### Repository klonen

```bash
cd / #(Pfad zu deinem Verzeichnis)
git clone https://github.com/RecyclRoute/RecyclRoute.git
```

### Datenbank aufsetzen

#In pgAdmin4 eine neue Datendank aufsetzen mit em Namen gis_database. Das Projekt ist ausgelegt, das es auf dem Localhost 5432 mit dem user postgis läuft. Allfällige Anpassungen sind im server\app / main.py in Zeile 36-40 vorzunehmen. Dort muss auch noch das verwendete Password eingesetzt werden. 

#Sobald die Datenbank erstellt ist, kann folgendes SQL in den Querys eingegeben werden um die Datendank aufzustezen:

```sql
-- Erweiterung für PostGIS installieren
CREATE EXTENSION IF NOT EXISTS postgis;

-- Sequenzen für die IDs erstellen
CREATE SEQUENCE IF NOT EXISTS project_id_seq;
CREATE SEQUENCE IF NOT EXISTS points_id_seq;

-- Tabelle 'project' erstellen
CREATE TABLE IF NOT EXISTS public.project (
    id integer NOT NULL DEFAULT nextval('project_id_seq'::regclass),
    name text NOT NULL,
    gemeindename text NOT NULL,
    perimeter geometry(Polygon, 3857),
    CONSTRAINT project_pkey PRIMARY KEY (id)
);
ALTER TABLE public.project OWNER TO postgres;

-- Tabelle 'points' erstellen
CREATE TABLE IF NOT EXISTS public.points (
    id integer NOT NULL DEFAULT nextval('points_id_seq'::regclass),
    project_id integer,
    type character varying(50),
    date date,
    picture bytea,
    geom geometry(Point, 4326),
    CONSTRAINT points_pkey PRIMARY KEY (id),
    CONSTRAINT points_project_id_fkey FOREIGN KEY (project_id)
        REFERENCES public.project (id) ON UPDATE NO ACTION ON DELETE CASCADE,
    CONSTRAINT points_type_check CHECK (
        type IN (
            'Recyclingut falsch deponiert',
            'Recyclingut nicht abgeholt',
            'Recyclingut enthält Fremdstoffe',
            'Andere'
        )
    )
);
ALTER TABLE public.points OWNER TO postgres;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'spatial_ref_sys'
    ) THEN
        CREATE TABLE public.spatial_ref_sys (
            srid integer NOT NULL,
            auth_name character varying(256),
            auth_srid integer,
            srtext character varying(2048),
            proj4text character varying(2048),
            CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid),
            CONSTRAINT spatial_ref_sys_srid_check CHECK (srid > 0 AND srid <= 998999)
        );
        ALTER TABLE public.spatial_ref_sys OWNER TO postgres;
    END IF;
END $$;

REVOKE ALL ON TABLE public.spatial_ref_sys FROM PUBLIC;
GRANT SELECT ON TABLE public.spatial_ref_sys TO PUBLIC;
GRANT ALL ON TABLE public.spatial_ref_sys TO postgres;

```

### Virtualenvironment erstellen
In VSC im Powershell Terminal folgende Codes nacheinander eingeben, um das Virtuelle Environment zu installieren:

```
# Link durch den effektiven ablageort von Python3.11.7 ersetzen.
& "C:\Program Files\Python311\python.exe" -m venv recyclroute-venv 
# Python Virtual environment aktualisieren
.\recyclroute-venv\Scripts\activate 
# Pip auf das neuste Format upgraden
python -m pip install --upgrade pip
# Requirements installieren
.\recyclroute-venv\Scripts\python.exe -m pip install -r requirements.txt 
```

### Valhalla mit Docker installieren
Als Voraussetzung muss Docker bereits installiert sein. 
### Frontend einrichten

```bash
cd RecyclRoute/client
npm install
npm start
```

## 🧪 Getestete Versionen

- Die getesteten Versionen sind in Requirements.txt ersichtlich. Das ganze ist basierend auf Python 3.11.7 aufgebaut. Und läuft mit Valhalla Version XYZ.

## 📁 Projektstruktur

```
RecyclRoute/
├── client/             # Frontend-Anwendung Hauptpfad
│   └── public/            # FastAPI-Anwendung
│       └── data/            # FastAPI-Anwendung
│   └── src/            # FastAPI-Anwendung
│       └── components/            # FastAPI-Anwendung
│           └── error_page/            # FastAPI-Anwendung
│           └── icons/            # FastAPI-Anwendung
│           └── map/            # FastAPI-Anwendung
│           └── planner_page/            # FastAPI-Anwendung
│               └── navigation/            # FastAPI-Anwendung
│                   └── navigation_header_footer/            # FastAPI-Anwendung
│               └── plannerpage_footer/            # FastAPI-Anwendung
│               └── plannerpage_header/            # FastAPI-Anwendung
│               └── project_manager/            # FastAPI-Anwendung
│           └── report_page/            # FastAPI-Anwendung
│               └── add_marker/            # FastAPI-Anwendung
│               └── reportpage_footer/            # FastAPI-Anwendung
│               └── reportpage_header/            # FastAPI-Anwendung
│           └── start_page/            # FastAPI-Anwendung
│       └── data/            # FastAPI-Anwendung
├── docs/             # Backend-Anwendung
├── preprocessing/             # Backend-Anwendung
├── routing-valhalla/             # Backend-Anwendung
├── server/             # Backend-Anwendung
│   └── app/            # FastAPI-Anwendung
│   └── routing_valhalla/            # FastAPI-Anwendung
│   └── script_py/            # FastAPI-Anwendung
├── README.md           # Projektbeschreibung
└── requirements.txt    # Benötigte Module in Virtuelen Environment
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
