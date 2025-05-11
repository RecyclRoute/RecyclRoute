---
layout: default
title: RecyclRoute – Geodateninfrastruktur
---
# Aufbau der Geodateninfrastruktur (GDI)
<a id="top"></a>

Die Geodateninfrastruktur von **RecyclRoute** besteht aus einem Backend, einem Frontend sowie verschiedenen Bibliotheken und API-Schnittstellen. Die folgende Darstellung zeigt die Systemarchitektur von RecyclRoute:

<div id="gdi-final"></div>

![GDI Architektur Schema](Bilder/GDI_Architektur_final.png)

## Backend

Das Backend umfasst sämtliche Server-seitigen Prozesse und Daten. Die zugrundeliegende PostgreSQL/PostGIS-Datenbank wird über ein Python-Skript automatisiert mit Geo- und Routendaten befüllt. Der **GeoServer** stellt dabei die zentrale Schnittstelle dar, um die Daten aus der Datenbank als Webdienste (WMS/WFS) bereitzustellen. Über das Frontend wird via HTTP (z. B. Axios) auf diese Dienste zugegriffen.

### Grundlagedaten
<div id="grundlagedaten"></div>

Die Grundlagedaten bestehen aus **Recycling-Sammelstellen**, **Straßennetzen** und **Einzugsgebieten**, ergänzt durch eigens berechnete Routen. Die Straßendaten stammen aus der [swissTLM3D](https://www.swisstopo.admin.ch/de/geodata/landscape/tlm3d.html), die Routen werden durch ein angepasstes Python-Routing-Skript (basierend auf dem Chinese Postman Problem) generiert. Die Ergebnisse werden in GeoJSONs gespeichert und in die Datenbank importiert.

Die Datenstruktur ist so aufgebaut, dass neue Regionen, Fraktionen oder Sammelarten (z. B. Glas, PET) leicht integriert werden können. Die Skripte zur Datenverarbeitung befinden sich im Repository unter `preprocessing/`.

## Datenbank

Die Datenbank wurde in PostgreSQL/PostGIS aufgebaut. Sie enthält u. a. folgende Tabellen:
- `route` (berechnete Linien als Geometrie mit Reihenfolge und Attributen)
- `sammelstellen` (Punkte mit Adresse, Fraktion, Erfassungszeitraum)
- `netzwerk` (zugrunde liegendes Straßennetz aus swissTLM3D)

Zur Visualisierung wurden **Views** erstellt, z. B.:
- `vw_route_vollständig` – vollständige Route inklusive Wiederholungen
- `vw_sammelpunkte` – aufbereitete Standorte
- `vw_routenabschnitte` – segmentweise Darstellung mit Zustandsattributen

Die Daten werden über den GeoServer veröffentlicht und im Frontend genutzt.

## Geoserver

Die vorbereiteten Datenbank-Views werden im **GeoServer** als WMS- oder WFS-Dienste publiziert. Diese werden im Frontend per OpenLayers eingebunden, wodurch interaktive Kartenvisualisierung, Routenhighlighting und Layersteuerung möglich sind.

## Frontend
<div id="frontend"></div>

Das Frontend von RecyclRoute ist eine interaktive Webanwendung, die auf [React](https://react.dev/), [OpenLayers](https://openlayers.org/) und [Axios](https://axios-http.com/docs/intro) basiert. Es besteht aus mehreren Komponenten:

### React

[React](https://react.dev/) dient dem Aufbau der Benutzeroberfläche. Es wird verwendet, um interaktive Elemente wie die Kartenansicht, Navigation, Filterfunktionen und Infoboxen umzusetzen. Der Zustand der Anwendung (z. B. „aktueller Streckenabschnitt“) wird komponentenbasiert verwaltet.

### npm

Der [Node Package Manager (npm)](https://www.npmjs.com/) wird verwendet, um alle benötigten Bibliotheken und Abhängigkeiten (z. B. OpenLayers, Axios, Zustand) zu verwalten und das Frontend zu bauen.

### OpenLayers

[OpenLayers](https://openlayers.org/) ist für die Darstellung und Interaktion mit der Karte zuständig. Layer aus dem GeoServer (WMS/WFS) werden eingebunden, Streckenabschnitte hervorgehoben und Benutzerinteraktionen ermöglicht. Die Abfrage von Features (z. B. aktuell bearbeiteter Routenabschnitt) erfolgt dynamisch via `getSource().getFeatures()`.

### UI Design
<div id="ui-design"></div>

Das Design von RecyclRoute ist bewusst **minimalistisch und funktional** gehalten. Die Farben Grün, Beige und Dunkelbraun spiegeln das Thema Nachhaltigkeit und Orientierung wider. Buttons und Kartenlayer sind einheitlich gestaltet und reagieren auf Mausbewegungen durch Hover- und Fokuszustände.

Alle UI-Komponenten wurden manuell mit [HTML](https://developer.mozilla.org/de/docs/Web/HTML) und [CSS](https://developer.mozilla.org/de/docs/Web/CSS) gestaltet. Dropdowns und interaktive Felder wurden mit [Material UI](https://mui.com/) realisiert.

### UX Design
<div id="ux-design"></div>

Im Zentrum steht eine **intuitive Nutzerführung**: Sammelstellen, Routen und Status lassen sich einfach erkunden, bearbeiten und aktualisieren. Die Anwendung wurde im Rahmen eines UX-Tests mit 6 Testpersonen auf Bedienbarkeit überprüft. Feedback floss in die Gestaltung der Navigationsstruktur, Buttonplatzierung und Interaktionsrückmeldungen ein.

Die meisten Aktionen erfordern **maximal zwei Klicks**, um von einer Sammelstelle zur vollständigen Route zu navigieren oder den Bearbeitungsstatus einer Straße zu aktualisieren.

---

[↑ Zurück zum Beginn der Webseite](#top) 

<div style="display: flex; justify-content: space-between;">
  <div>
    <a href="funktionen.html">← Erklärung der Funktionen</a>
  </div>
  <div>
    <a href="konzept.html">Konzept und Ideen →</a>
  </div>
</div>
