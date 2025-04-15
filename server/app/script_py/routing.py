import os
import json
import polyline
import geojson
from routingpy import Valhalla

# 🔁 Hilfsfunktion zum Aufteilen in Blöcke
def chunk_coords(coords, size=40):
    for i in range(0, len(coords) - 1, size - 1):
        yield coords[i:i+size]

# 📂 Dateipfade
DATA_PATH = "client/public/data/coordinates.json"
OUTPUT_PATH = "client/public/data/coordinates_output.geojson"

# 📥 Koordinaten laden
with open(DATA_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

coords = data["coordinates"]
client = Valhalla()
all_features = []

# 🔁 Routing für jede Etappe
for chunk in chunk_coords(coords, size=20):
    print(f"→ Anfrage für {len(chunk)} Punkte")

    try:
        route = client.directions(
            locations=chunk,
            profile="auto",
            options={"directions_options": {"units": "kilometers"}}
        )
    except Exception as e:
        print(f"⚠️ Routing-Fehler: {e}")
        continue

    trip = route.raw.get("trip", {})
    legs = trip.get("legs", [])

    if not legs:
        print("⚠️ Keine Legs gefunden – Abschnitt übersprungen")
        continue

    shape = polyline.decode(legs[0]["shape"])  # [lat, lon] – muss getauscht & skaliert werden

    if "maneuvers" not in legs[0]:
        print("⚠️ Keine Manöver – gesamte Linie wird gespeichert")
        segment = [[lon / 10, lat / 10] for lat, lon in shape]
        feature = geojson.Feature(
            geometry=geojson.LineString(segment),
            properties={
                "instruction": "Komplette Route (ohne Manöver)",
                "type": "none",
                "length_m": round(legs[0]["summary"]["length"] * 1000, 2),
                "time_s": legs[0]["summary"]["time"]
            }
        )
        all_features.append(feature)
        continue

    # ✅ Turn-by-turn vorhanden
    for maneuver in legs[0]["maneuvers"]:
        start = maneuver["begin_shape_index"]
        end = maneuver["end_shape_index"]
        segment = [[lon / 10, lat / 10] for lat, lon in shape[start:end+1]]
        feature = geojson.Feature(
            geometry=geojson.LineString(segment),
            properties={
                "instruction": maneuver["instruction"],
                "type": maneuver["type"],
                "length_m": round(maneuver["length"] * 1000, 2),
                "time_s": maneuver["time"]
            }
        )
        all_features.append(feature)

# 💾 GeoJSON speichern
feature_collection = geojson.FeatureCollection(all_features)

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    geojson.dump(feature_collection, f, indent=2)

print(f"✅ Route gespeichert: {OUTPUT_PATH}")
