---
layout: default
title: Ausblick
---
<a id="top"></a>

# Erweiterungsmöglichkeiten
<div id="erweiterungsmöglichkeiten"></div>
Im folgenden Abschnitt werden für gewisse Seiten und Funktion Verbesserungs- und Erweiterungsvorschläge genannt, welche Vorteile für die User Experience (User Erfahrung) bieten oder die Funktionen der RecyleRoute erweitern.

### Allgemein
<div id="allgemein"></div>
Die Materialauswahl könnte hinzugefügt werden, um somit jedem Projekt und/oder Point of interest ein Materialtyp zuzuweisen. Dies erlaubt es weiteren Nutzenden die Verwendung der Anwendung zu ermöglichen.

### Startpage
<div id="startpage"></div>
In einer Besprechung wurde festgestellt, dass der Erklärungstext für die Planner- und Reportseite aufgeteilt werden könnte, um somit die gesamte Startseite übersichtlicher zu gestalten. Der Erklärungstext sollte ebenfalls vertikal in zwei Spalten unterteilt werden damit er jeweils zu einem Button zuordbar ist. 

### Planner
<div id="planner"></div>
Diverse Statistiken, zu verschiedenen Themen, im Bereich Recycling, könnten in einem weiteren Popup erstellt werden. Diese umfassen zum Beispiel: Heatmaps, Bottleneck-Analysen oder Punkttyp-Analysen zu den Point of interests. 

### Report
<div id="report"></div>
In der Reportpage sollen möglichst keine weiteren Features implementiert werden, da diese Seite für ein sehr breites Publikum gedacht ist und daher möglichst einfach zu verstehen und zu nutzen bleiben soll. 

### Routenberechnung
<div id="routenberechnung"></div>
Die Erstellung/Installation von dem Valhalla Docker Server könnte besser dokumentiert werden damit, die Routingfuntkionen auf verschiedenen Rechner verwendet werden kann.
Die vom Backend berechnete Route könnte in die Datenbank geschrieben werden anstatt wie zum heutigen Stand in temporäre Dateien damit diese Projektübergreifend verfügbar sind.
Der Userpfad zum eine Neues Projekt zu erstellen und direkt eine Route zu berechnen könnte optimiert werden damit die Nutzenden weniger warten müssen. Dies setzt vor allem Optimierung seitens des Servers in der Ausführung der Routenberechnung vor.

### Navigation
<div id="navigation"></div>
Die Navigation ist momentan nur mit statischen Testdaten umgesetzt. Dies ist darauf zurückzuführen dass die Routenberechnung noch nicht vollständig ausgeführt werden kann und dass die berechnete Route noch nicht in die Datenbank gespeichert wird. Aufgrund vom verwendeten Algorithmus in Valhalla wird nach jedem Strassenabschnitt das Routing beendet und eine neue Route wird gestartet. Somit sind die erhaltenen und dargestellten Befehle noch nicht optimal. Zudem ist die Farbliche Unterscheidung zwischen dem aktiven Abschnitt, den drei nächsten Abschnitten, den weiteren noch nicht erledigten Abschnitten und den Erledigten Abschnitten noch nicht verfügbar. Dies liegt ebenfalls daran das die Route immer wieder unterbrochen wird. 


[↑ Zurück zum Beginn der Webseite](#top) 


<div style="display: flex; justify-content: space-between;">
  <div>
    <a href="aufbauGDI.html">← Aufbau GDI/a>
  </div>
</div>
