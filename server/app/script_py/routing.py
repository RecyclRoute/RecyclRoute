import json
from routingpy import Valhalla
from pprint import pprint

# 1. Lade die Koordinaten aus der JSON-Datei
with open("public/data/coordinates.json", "r", encoding="utf-8") as f:
    coords = json.load(f)

# 2. Stelle sicher, dass die Koordinaten im Format [[lng, lat], ...] vorliegen
# Wenn du z. B. [lat, lng] hättest, müsstest du sie umdrehen:
# coords = [[lng, lat] for lat, lng in coords]

# 3. Baue die Route mit routingpy
client = Valhalla()
route = client.directions(locations=coords, profile='pedestrian')

# 4. Zeige die Ergebnisse an
pprint({
    "geometry": route.geometry,
    "duration": route.duration,  # in Sekunden
    "distance": route.distance,  # in Meter
    "raw": route.raw  # vollständige Antwort
})
