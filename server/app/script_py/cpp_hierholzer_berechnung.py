import networkx as nx
import pyproj
import pickle
import geojson
import json
from collections import Counter

# Pfade
INPUT_GRAPH = "prepared_graph.pkl"
OUTPUT_GEOJSON = "chinese_postman_path.geojson"
OUTPUT_COORDINATES_PY = "coordinates.py"
OUTPUT_COORDINATES_JSON = "coordinates.json"


def chinese_postman(graph):
    print("Starte Chinese Postman Algorithmus...")

    odd_nodes = [n for n, d in graph.degree() if d % 2 != 0]
    print(f"Anzahl ungerader Knoten: {len(odd_nodes)}")

    path_lengths = dict(nx.all_pairs_dijkstra_path_length(graph, weight='weight'))
    path_dict = dict(nx.all_pairs_dijkstra_path(graph, weight='weight'))

    G_matching = nx.Graph()
    for i, u in enumerate(odd_nodes):
        for v in odd_nodes[i + 1:]:
            if v in path_lengths[u]:
                G_matching.add_edge(u, v, weight=path_lengths[u][v])

    print("Führe globales Pfad-Matching durch...")
    matching = list(nx.algorithms.matching.min_weight_matching(G_matching))

    print("Zähle benötigte Kanten auf Basis der Matching-Pfade...")
    edge_usage = Counter()
    for u, v in matching:
        path = path_dict[u][v]
        for i in range(len(path) - 1):
            edge = tuple(sorted((path[i], path[i + 1])))
            edge_usage[edge] += 1

    for u, v in graph.edges():
        edge = tuple(sorted((u, v)))
        edge_usage[edge] += 1

    print("Starte Hierholzer auf vorbereitetem Kanten-Zähler...")
    circuit = []
    stack = [next(iter(graph.nodes))]

    while stack:
        u = stack[-1]
        neighbors = list(graph.neighbors(u))
        found = False
        for v in neighbors:
            edge = tuple(sorted((u, v)))
            if edge_usage[edge] > 0:
                edge_usage[edge] -= 1
                stack.append(v)
                found = True
                break
        if not found:
            circuit.append(stack.pop())

    total_weight = 0
    for i in range(len(circuit) - 1):
        u, v = circuit[i], circuit[i + 1]
        edge_data = graph.get_edge_data(u, v)
        if edge_data:
            total_weight += min(data['weight'] for data in edge_data.values())

    print(f"Gesamtlänge der Route: {total_weight:.2f} Meter")

    return total_weight, circuit, graph


def export_outputs(graph, circuit):
    print("Erstelle Export-Dateien...")

    transformer = pyproj.Transformer.from_crs("EPSG:2056", "EPSG:4326", always_xy=True)

    coordinates = []
    features = []

    for node in circuit:
        x = graph.nodes[node]['x']
        y = graph.nodes[node]['y']
        lon, lat = transformer.transform(x, y)
        coordinates.append([lon, lat])  # Für GeoJSON & RoutingPy
        # Optional: jeden Punkt auch einzeln als GeoJSON Feature
        point = geojson.Feature(
            geometry=geojson.Point((lon, lat)),
            properties={"node": node}
        )
        features.append(point)

    # Erstelle GeoJSON LineString
    line = geojson.Feature(
        geometry=geojson.LineString(coordinates),
        properties={"description": "Chinese Postman Route"}
    )
    features.append(line)

    # GeoJSON exportieren
    feature_collection = geojson.FeatureCollection(features)
    with open(OUTPUT_GEOJSON, 'w') as f:
        geojson.dump(feature_collection, f, indent=2)
    print(f"GeoJSON-Datei gespeichert als '{OUTPUT_GEOJSON}'")

    # Python Koordinaten-Liste exportieren
    with open(OUTPUT_COORDINATES_PY, 'w') as f:
        f.write("# Direkt importierbare Koordinatenliste für RoutingPy\n")
        f.write("ROUTING_COORDINATES = [\n")
        for lon, lat in coordinates:
            f.write(f"    ({lon}, {lat}),\n")
        f.write("]\n")
    print(f"Koordinaten als Python-Datei gespeichert als '{OUTPUT_COORDINATES_PY}'")

    # Optional: JSON exportieren
    with open(OUTPUT_COORDINATES_JSON, 'w') as f:
        json.dump({"coordinates": coordinates}, f, indent=2)
    print(f"Koordinaten als JSON-Datei gespeichert als '{OUTPUT_COORDINATES_JSON}'")


def main():
    print("Lade vorbereiteten Graph...")
    with open(INPUT_GRAPH, "rb") as f:
        graph = pickle.load(f)

    total_length, circuit, full_graph = chinese_postman(graph)

    export_outputs(full_graph, circuit)


if __name__ == "__main__":
    main()
