---
layout: default
title: Installation
---
<a id="top"></a>

# Installation der Applikation

Hier findest du eine Schritt-für-Schritt-Anleitung zur Installation der Applikation. Der gesamte Quellcode ist auf GitHub verfügbar.

## Voraussetzungen

Bitte installiere vorab die folgenden Tools. Die jeweils getesteten Versionen sind angegeben:


<ul>
  <li><a href="https://www.python.org/downloads/release/python-3117/">Python 3.11.7</a></li>
  <li><a href="https://code.visualstudio.com/">Visual Studio Code 1.99.3</a></li>
  <li><a href="https://docs.docker.com/desktop/setup/install/windows-install/">Docker</a></li>
  <li><a href="https://www.postgresql.org/ftp/pgadmin/pgadmin4/v9.1/windows/">pgAdmin 4 (Version 9.1)</a></li>
  <li>Valhalla 3.5.1</li>
  <li>Weitere Python-Abhängigkeiten: <a href="assets/downloads/requirements.txt">requirements.txt</a></li>
</ul>



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
   - Passwort: Manuell in server/app/main.py in den Zeilen 36–40 eintragen (Standardwert: ADMIN).
3. Anschliessend im Query-Tool von pgAdmin den folgenden SQL-Code ausführen, um die notwendigen Tabellen und Erweiterungen anzulegen:

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
            'Recyclinggut falsch deponiert',
            'Recyclinggut nicht abgeholt',
            'Recyclinggut enthält Fremdstoffe',
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

Falls sich Python 3.11.7 nicht unter dem untenstehenden Pfad befindet, bitte entsprechend anpassen:

```bash
& "C:\Program Files\Python311\python.exe" -m venv recyclroute-venv
.
recyclroute-venv\Scripts activate
python -m pip install --upgrade pip
.
recyclroute-venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Valhalla mit Docker installieren

Der Pfad zum Valhalla-Verzeichnis muss angepasst werden, sodass folgende Struktur entsteht: RecyclRoute/valhalla_docker/valhalla_data.

```bash
docker run -dt --name valhalla_server -p 8002:8002 -v C:/Pfad/zum/verzeichnis/valhalla_docker/valhalla_data:/custom_files -e tile_urls=https://download.geofabrik.de/europe/switzerland-latest.osm.pbf ghcr.io/nilsnolde/docker-valhalla/valhalla:latest
```

Die Installation kann bis zu 40 Minuten dauern und läuft im Hintergrund. Den Fortschritt kann man mit folgendem Befehl überprüfen:

```bash
docker logs -f valhalla_server
```

### Preprocessing ausführen

Herunterladen des SwissTLM3D und vorbereiten für die berechnung im Hintergrund:

```bash
python preprocessing/Preprocessing_swisstlm3d_2025-03_Data.py
```

## Starten der Anwendung
Die folgenden Komponenten müssen parallel in jeweils eigenen Terminalfenstern oder Tabs gestartet werden:
### Docker starten

```bash
docker start valhalla_server
```
### Frontend starten

```bash
cd client
npm install
npm start
```

### Backend starten

Backend 1 (Port 8000)
```bash
uvicorn server.app.main:app --reload --port 8000
```

Backend 2 (Port 7999)
```bash
uvicorn server.app.main2:app --reload --port 7999
```

Achte darauf, dass für jeden der letzten vier Befehle ein neues Terminal verwendet wird, damit die Prozesse parallel laufen können.

<div style="margin-top: 3em;"></div>

Die Gründe für 2 Backend sind im <a href="aufbauGDI.html">Aufbau GDI </a> dargelegt. 

<div style="margin-top: 3em;"></div>

[↑ Zurück zum Beginn der Webseite](#top) 

<div style="display: flex; justify-content: space-between;">
  <div>
    <a href="aufbauGDI.html">← Aufbau GDI</a>
  </div>
  <div>
    <a href="konzept.html">Erklärung des Konzepts →</a>
  </div>
</div>
