---
layout: default
title: Funktionen
---
# Erklärung der Funktionen von RecyclRoute
<a id="top"></a>
In diesem Abschnitt werden die Funktionen und Interaktionen der RecyclRoute beschrieben.

# Startpage
<div id="startpage"></div>
Auf der Startseite muss man sich bereits ein erstesmal entscheiden was man machen möchte. Wenn man Papier- oder Kartonsammlungen organisieren oder deine Route planen möchtest, muss man auf Planner klicken. Wenn du nicht abgeholtes oder falsch deponiertes Material melden möchtest, muss man auf Report klicken. Dann wird man dementsprechend auf die Seite mit den Entsprechenden Seiten geleitet. 

![Startseite](assets/images/Startpage_1.png){: style="max-width: 75%; height: auto;" }

# Funktionen Report:
Nach dem Klicken auf Report wird man auf die Report Seite (brauntöne) weitergeleitet. Auf welcher die Standartfunktionen GNSS, Norden der Karte, Anzeigen der Punkte des Projektes funktionieren, sowie der Report erstellen.

![Startseite Report](assets/gifs/report_page.gif){: style="max-width: 75%; height: auto;" }

## Report erstellen
Mit dem klicken auf den Button unten rechts, kann ein neuer Report erstellt werden. Dazu muss vorab aber schon ein Projekt erstellt worden sein, damit man auch den Report auch einem Projekt zuweisen kann. Mit auswählen des Projektes einer Bemerkung (nur Dropdown möglichkeiten) ein Datum eingegeben werden sowie ein Foto hochgeladen werden. Ebenso muss zwingend ein Punkt abgesetzt werden mit klicken auf die Karte. Dieser kann verschoben werden durch nochmaliges klicken. Mit Punkt speichern wird der Punkt in die Datenbank gespeichert und das Popup schliesst sich automatisch.

![Report erstellen](assets/gifs/report_erstellen.gif){: style="max-width: 75%; height: auto;" }

# Funktionen allgemein:
Folgende drei Funktionen sind sowohl im Report als auch im Planner enthalten:

## Reportpunkte des Projektes anzeigen
Damit kann ein Projekt ausgewählt werden und alle dem Projekt zugeordneten Projektpunkte angezeigt werden.

![Projektpunkte einblenden](assets/gifs/projektpunkte.gif){: style="max-width: 75%; height: auto;" }

## Aktueller Standort anzeigen
Mit der Funktion wird die GNSS Position des Gerätes abgegriffen, wenn eingeschalten & die Karte Zoom auf diesen Standort und zeigt die Position als Blauen Marker. 

![GNSS](assets/GIFs/GNSS_Punkt.gif){: style="max-width: 75%; height: auto;" }

## Karte nach Norden ausrichten
Mit dieser Funktion kann die Karte wieder nach Norden ausgerichtet werden wenn die Karte verdreht ist. 

![Norden](assets/GIFs/north.gif){: style="max-width: 75%; height: auto;" }

# Funktionen Planner:
Nach dem Klicken auf Planner wird man auf die Planner Seite (grüntöne) weitergeleitet. Auf welcher die Standartfunktionen GNSS, Norden der Karte, Anzeigen der Punkte des Projektes sowie das Planen der Route sowie das Managen der Projekte implementiert ist.

![Startseite Planer](assets/gifs/planner_page.gif.gif){: style="max-width: 75%; height: auto;" }

## Projektmanager
Um den Projektmanager abzurufen, kann auf den Button unten rechts geklickt werden. Sobald dieser gestartet ist sieht man alle Projekte welche in der DB gespecihert sind. Durch klicken auf ein bestimmtes Projekt kommt ein weiteres Popup, welches vier Buttons aufweist und als Titel die Projektbezeichnung enthält.

- Route berechnen; damit kann die Route des Projektes neugerechnet werden
- Routing starten; damit kann man wenn ein Routing vorhanden ist dieses starten
- Statistiken; damit können Statistiken abgerufen werden
- Projekt löschen; damit kann das Projekt aus der DB gelöscht werden.

Mit dem kleinen x kann man den Projektmanager wieder schliessen.

![Projektmanager](assets/GIFs/projektmanager.gif){: style="max-width: 75%; height: auto;" }

### Neues Projekt erstellen
Im Projektmanager ganz unten gibt es den Button **Neues Projekt erstellen**. Damit kann ein neues Projekt erstellt werden. Es erscheint ein neues Popup, in welchem man den Projektnamen, die Gemeinde, sowie ein Sammeldatum auswählen kann.

![neues Projekt](assets/GIFs/neues_projekt.gif){: style="max-width: 75%; height: auto;" }

### Polygon definieren & Startpunkt setzen
Mit klick auf **Weiter** bestätigt man die Eingaben und man kommt auf die Karte wo man ein Polygon definieren muss welches das ganze Gebiet exakt umschliesst. Mit Doppelklick oder klick auf den Button **Perimeter speichern** bestätigt man die Eingabe. Danach muss man noch der Startpunkt der Routensammlung definieren durch klicken auf einen Standort innerhalb des gewählten Polygons.

![Polygon_definieren](assets/GIFs/polygon_definieren.gif){: style="max-width: 75%; height: auto;" }

Anschliessend kommt eine Meldung, dass die Berechnung der Route im Hintergrund passiert und man sobald die Route berechnet wurde weiter geleitet zur Navigation wird. 

### Berechnungsalgorithmus
<div id="berechnungsalgorithmus"></div>
Nachfolgend ist der ganze Berechnungsalgorithmus erklärt, wie er aufgebaut ist. Zuerst werden grundlegende Punkte erklärt und anschliessend der Ablauf und die theoretischen Grundlagen dahinter versucht zuerläutern. 

#### **Routing- und Optimierungs-Tool für vollständige Wegenetzbefahrung**

Das ganze ist in einem Python-Skript aufgebaut und soll automatisiert eine optimale Route durch ein definiertes Strassennetz berechnen. Ziel ist es, alle relevanten Strassen in einem Gebiet möglichst effizient und ohne doppelte Befahrung abzufahren – ähnlich zum sogenannten Chinese Postman Problem welches eher Bekannt ist.

**Eingaben**

Als Eingaben von der App zum das Skript auszuführen folgende Daten benötigt:

- Ein JSON welches das Polygon definiert
- Ein Geopackage Datei welche mit einem Weiteren Skript vorbereitet werden muss (Preprocessing) und enthält die Geometrien und Eigenschaften der Strassenachsen
- Die Startkoordinaten welche den Ausgangspunkt der Route dienen

**Ausgaben**

Als Ausgabe werden mehrere Dateien welche verwendet werden können / in Zukunft verwendet werden könnten.
- eine Datei mit der gesamten berechneten Route als GeoJSON
- Eine Datei mit Navigationsanweisungen

**Verwendete Module**

Das Skript verwendet unter anderem folgende Python-Bibliotheken:

- Für Geodatenverarbeitung: geopandas, shapely, pyproj, networkx

- Für numerische und graphentheoretische Operationen: numpy, scipy.spatial.cKDTree

- Für Optimierung: ortools (Google OR-Tools)

- Für Routing-Anfragen: requests in Verbindung mit einer lokalen Valhalla-Instanz

- Für allgemeine Dateiverarbeitung: json, os

**Ablauf und Theoretischen Grundlagen**

Zunächst werden die Startkoordinaten vom Koordinatensystem EPSG:3857 (Standart von **Open Layers**) in das Schweizer Landeskoordinatensystem EPSG:2056 transformiert. Anschliessend wird das Strassennetz im Zielgebiet aufbereitet.

Die Aufbereitung erfolgt durch Einlesen des GeoPackage-Layers und Filtern irrelevanter bzw. unzulässiger Strassen. Dabei werden folgende Eigenschaften ausgeschlossen:

Objektarten wie: Ausfahrt, Einfahrt, Autobahn, Raststätte, Zufahrt, Dienstzufahrt, Autozug, Fähre, Autostrasse, Klettersteig, Provisorium

- Wanderwegtypen wie: Wanderweg, Bergwanderweg, Alpinwanderweg sowie andere

- Verkehrsbeschränkungen wie: Allgemeines Fahrverbot, Fussweg, Fussgängerzone, Gebührenpflichtig, Gesicherte Kletterpartie, Militärstrasse, Radweg, Radweg und Fussweg, Reitweg, Reitweg und Fussweg, Rennstrecke, Panzerpiste, Teststrecke, Allgemeine Verkehrsbeschränkung, Gesperrt

- Belagsarten wie: Natur


Danach werden die Liniengeometrien der verbleibenden Strassen analysiert. Einzelne Punkte entlang der Linien werden mittels Punkt-Snapping zusammengeführt, falls sie sich innerhalb einer bestimmten Toleranz (0.5 Meter) befinden. Gerade Strassenabschnitte, die einen Winkel von mehr als 170 Grad zwischen den Segmenten aufweisen, werden automatisch zusammengeführt.

Aus diesen Segmenten wird ein ungerichteter Multigraph erzeugt, in dem die Punkte als Knoten und die Strassenabschnitte als Kanten dargestellt sind. Danach werden zu kleine oder isolierte Komponenten (weniger als drei Knoten) entfernt.

Mit diesem Graphen wird danach auf eine Art das Chinese Postman Problem angegangen. Dazu werden alle Knoten mit ungeradem Knotengrad identifiziert. Diese Knoten werden paarweise so verbunden, dass die zusätzlichen Verbindungen eine minimale Gesamtlänge haben. Diese Minimierung erfolgt durch eine Paarung via gewichteter Matching-Optimierung. Der resultierende Graph enthält ausschliesslich gerade Knotengrade und ist daher eulerisierbar – ein Eulerkreis kann gefunden werden, der alle Kanten exakt einmal durchläuft. Der Pfad wird mit dem Hierholzer-Algorithmus berechnet, beginnend beim der Startposition am nächstgelegenen Knoten.

Optional kann die erzeugte Koordinatenfolge noch gefiltert werden, um Punkte mit zu geringem Abstand (z. B. unter 10 Metern) zu entfernen. Dieser Schritt ist jedoch standardmässig deaktiviert.

Für die weitere Optimierung wird eine Distanzmatrix aufgebaut, welche die realen Wegstrecken zwischen allen Koordinaten enthält. Diese Distanzen werden nicht als Luftlinie, sondern über Valhalla als echte Reisewege berechnet. Dabei erkennt das Skript automatisch, ob Auto- oder Fuss-Routing verwendet werden muss, da dies nicht zwingend Identisch sein muss wie die Daten welche aus dem gpkg SwissTLM3D bezogen wurden. Die Matrixberechnung erfolgt parallelisiert mit mehreren Threads.

Mit dieser Distanzmatrix wird auf eine Art das Traveling Salesman Problem (TSP) gelöst – also die Reihenfolge bestimmt, in der die Punkte mit geringster Gesamtreiselänge besucht werden. Dies geschieht mithilfe der Google OR-Tools mit der Strategie „Pfad mit geringstem Startbogen“.

Im letzten Schritt werden die optimierten Koordinaten in Teilblöcke unterteilt und jeweils bei Valhalla (selber gehostet) angefragt, um echte turn-by-turn Navigationen zu erhalten. Pro Block werden JSON- und GeoJSON-Dateien erzeugt. Diese werden zu einer Gesamtroute zusammengefügt und als finale GeoJSON-Datei gespeichert. Parallel dazu werden detaillierte Navigationsanweisungen in ausgegeben.

[↑ Zurück zum Beginn der Webseite](#top) 


<div style="display: flex; justify-content: space-between;">
  <div>
    <a href="konzept.html">← Konzept</a>
  </div>
  <div>
    <a href="aufbauGDI.html">Aufbau GDI →</a>
  </div>
</div>