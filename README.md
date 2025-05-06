# RecyclRoute

**RecyclRoute** ist ein GIS-basiertes Webportal zur Planung und Optimierung von Sammelrouten für Papier- und Kartonabfälle.  
Das Projekt wurde im Rahmen des Moduls 4230 an der FHNW in Muttenz entwickelt. Es kombiniert moderne Webtechnologien mit Komponenten einer Geodateninfrastruktur, um eine effiziente und benutzerfreundliche Lösung für die Abfallwirtschaft bereitzustellen.

## Projektübersicht

- **Frontend**: React.js, OpenLayers  
- **Backend**: FastAPI, GeoServer  
- **Deployment**: GitHub Pages

## Live-Demo

Die Anwendung ist hier verfügbar:  
[https://recyclroute.github.io/RecyclRoute/](https://recyclroute.github.io/RecyclRoute/)

## Voraussetzungen

Bitte installiere vorab folgende Tools:

- [Python 3.11.7](https://www.python.org/downloads/release/python-3117/)
- [Visual Studio Code 1.99.3](https://code.visualstudio.com/)
- [Docker](https://docs.docker.com/desktop/setup/install/windows-install/)
- [pgAdmin 4 (Version 9.1)](https://www.postgresql.org/ftp/pgadmin/pgadmin4/v9.1/windows/)

## Installation

### Repository klonen

```bash
cd /Pfad/zum/Verzeichnis
git clone https://github.com/RecyclRoute/RecyclRoute.git
```

### Datenbank einrichten

1. In pgAdmin eine neue Datenbank mit dem Namen `gis_database` anlegen.  
2. Das Projekt erwartet folgende Einstellungen:
   - Host: `localhost`
   - Port: `5432`
   - Benutzer: `postgis`
   - Passwort: Manuell eintragen in `server/app/main.py`, Zeilen 36–40.

3. Danach in pgAdmin folgenden SQL-Code im Query-Tool ausführen:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE SEQUENCE IF NOT EXISTS project_id_seq;
CREATE SEQUENCE IF NOT EXISTS points_id_seq;

CREATE TABLE IF NOT EXISTS public.project (
    id integer NOT NULL DEFAULT nextval('project_id_seq'::regclass),
    name text NOT NULL,
    date date,
    gemeindename text NOT NULL,
    perimeter geometry(Polygon, 3857),
    CONSTRAINT project_pkey PRIMARY KEY (id)
);
ALTER TABLE public.project OWNER TO postgres;

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

### Virtuelle Umgebung einrichten

```bash
& "C:\Program Files\Python311\python.exe" -m venv recyclroute-venv
.
recyclroute-venv\Scripts activate
python -m pip install --upgrade pip
.
recyclroute-venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Valhalla mit Docker installieren

```bash
docker run -dt --name valhalla_server -p 8002:8002 -v C:/Pfad/zum/verzeichnis/valhalla_docker/valhalla_data:/custom_files -e tile_urls=https://download.geofabrik.de/europe/switzerland-latest.osm.pbf ghcr.io/nilsnolde/docker-valhalla/valhalla:latest
```

Installationsfortschritt prüfen:

```bash
docker logs -f valhalla_server
```

Zum späteren Neustart:

```bash
docker start valhalla_server
```

### Preprocessing ausführen

```bash
python preprocessing/Preprocessing_swisstlm3d_2025-03_Data.py
```

### Frontend starten

```bash
cd RecyclRoute/client
npm install
npm start
```

## Getestete Versionen

- Python 3.11.7
- Valhalla (3.5.1)
- Abhängigkeiten: siehe [Requirements](requirements.txt)

## Projektstruktur
```Plaintext

RecyclRoute/
├── client/                          # React-Frontend-Anwendung
│   ├── build/                       # Produktionsbuild des Frontends (automatisch generiert)
│   ├── public/                      # Statische Inhalte wie HTML-Dateien, Icons etc.
│   │   └── data/                    # Zwischengespeicherte statische Daten
│   └── src/                         # Quellcode des Frontends
│       └── components/              # Strukturierte React-Komponenten
│           ├── error_page/                 # Komponenten für Fehlermeldungen
│           ├── icons/                      # Eigene Icons und SVG-Dateien
│           ├── map/                        # Kartenanzeige und Karteninteraktionen
│           ├── planner_page/              # Hauptseite für die Routenplanung
│           │   ├── navigation/                     # Live-Navigation mit Abbiegehinweisen
│           │   │   └── navigation_header_footer/   # Kopf- und Fußbereich der Navigation
│           │   ├── plannerpage_footer/             # Fußbereich der Planungsseite
│           │   ├── plannerpage_header/             # Kopfbereich der Planungsseite
│           │   └── project_manager/                # Verwaltung von Sammelprojekten
│           ├── report_page/                # Seite zum Melden von Problemen
│           │   ├── add_marker/                     # Marker auf Karte setzen und speichern
│           │   ├── reportpage_footer/              # Fußbereich der Meldeseite
│           │   └── reportpage_header/              # Kopfbereich der Meldeseite
│           └── start_page/                 # Einstiegsseite der Anwendung
├── docs/                            # Dokumentation für GitHub Pages
├── Licenses/                        # Lizenztexte der verwendeten Drittkomponenten
├── preprocessing/                   # Skripte zur Verarbeitung der SwissTLM3D-Grundlagen
├── server/                          # Backend-Verzeichnis mit FastAPI-Logik
│   ├── app/                         # API-Endpunkte und zentrale Backendstruktur
│   │   └── script_py/               # Valhalla-Routinglogik im Backend
├── CONTRIBUTING.md                  # Hinweise zur Mitentwicklung und zum Beitrag
├── License                          # Projektlizenz (MIT)
├── README.md                        # Projektübersicht, Setup- und Installationsanleitung
└── requirements.txt                 # Python-Abhängigkeiten für das Backend
```

## Mitwirken

Beiträge sind willkommen. Weitere Informationen findest du in der Datei [CONTRIBUTING.md](CONTRIBUTING.md).

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).

Verwendete Open-Source-Komponenten:

- [Valhalla Routing Engine](https://github.com/valhalla/valhalla), MIT-Lizenz  
  © 2015–2018 Mapillary AB, Mapzen, Valhalla contributors  
  → [Lizenztext anzeigen](licenses/valhalla_LICENSE.txt)

- [Valhalla-Docker](https://github.com/nilsnolde/valhalla-docker) von GIS•OPS UG, MIT-Lizenz  
  © 2022 GIS•OPS UG  
  → [Lizenztext anzeigen](licenses/valhalla-docker_LICENSE.txt)

Die vollständigen Lizenztexte befinden sich in den jeweiligen Repositories oder im Ordner [`licenses/`](licenses/).