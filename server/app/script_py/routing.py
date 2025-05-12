import json
import requests
import numpy as np
from tqdm import tqdm
from math import radians, cos, sin, asin, sqrt
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
import os
import pyproj
import geopandas as gpd
import networkx as nx
from shapely.geometry import Polygon, LineString
from shapely.validation import make_valid
from scipy.spatial import cKDTree

from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp


VALHALLA_URL = "http://localhost:8002"


def translate_start_coord(coord_3857):
    transformer = pyproj.Transformer.from_crs("EPSG:3857", "EPSG:2056", always_xy=True)
    x_2056, y_2056 = transformer.transform(coord_3857[0], coord_3857[1])
    return (x_2056, y_2056)


def prepare_graph(input_json, input_gpkg):
    UNWANTED_OBJEKTART = ['Ausfahrt', 'Einfahrt', 'Autobahn', 'Raststaette', 'Zufahrt',
                          'Dienstzufahrt', 'Autozug', 'Faehre','Autostrasse', 'Klettersteig', 'Provisorium']

    UNWANTED_WANDERWEG = ['Wanderweg', 'Bergwanderweg', 'Alpinwanderweg', 'andere']

    UNWANTED_VERKEHRSBESCHRAENKUNG = ['Allgemeines Fahrverbot', 'Fussweg', 'Fussgängerzone', 'Gebuehrenpflichtig',
                                      'Gesicherte Kletterpartie', 'Militaerstrasse', 'Radweg', 'Radweg und Fussweg',
                                      'Reitweg', 'Reitweg und Fussweg', 'Rennstrecke', 'Panzerpiste', 'Teststrecke',
                                      'Allgemeine Verkehrsbeschraenkung', 'Gesperrt']

    UNWANTED_BELAGSART = ['Natur']
    SNAP_TOLERANCE = 0.5
    ANGLE_THRESHOLD = 170

    def calculate_angle(p1, p2, p3):
        def vector(a, b):
            return (b[0] - a[0], b[1] - a[1])
        v1 = vector(p2, p1)
        v2 = vector(p2, p3)
        dot_product = v1[0] * v2[0] + v1[1] * v2[1]
        mag_v1 = np.hypot(*v1)
        mag_v2 = np.hypot(*v2)
        if mag_v1 == 0 or mag_v2 == 0:
            return 0
        cos_angle = dot_product / (mag_v1 * mag_v2)
        cos_angle = max(min(cos_angle, 1), -1)
        return np.degrees(np.arccos(cos_angle))

    def merge_straight_segments(graph):
        merged = True
        while merged:
            merged = False
            nodes_to_remove = []
            edges_to_remove = []
            for node in list(graph.nodes):
                if graph.degree(node) != 2:
                    continue
                neighbors = list(graph.neighbors(node))
                if len(neighbors) != 2:
                    continue
                angle = calculate_angle(neighbors[0], node, neighbors[1])
                if angle > ANGLE_THRESHOLD:
                    data1 = list(graph.get_edge_data(node, neighbors[0]).values())[0]
                    data2 = list(graph.get_edge_data(node, neighbors[1]).values())[0]
                    coords1 = list(data1['geometry'].coords)
                    coords2 = list(data2['geometry'].coords)
                    merged_coords = coords1 + coords2[1:]
                    new_geom = LineString(merged_coords)
                    total_weight = data1['weight'] + data2['weight']
                    graph.add_edge(neighbors[0], neighbors[1], weight=total_weight, geometry=new_geom)
                    edges_to_remove.extend([(node, neighbors[0]), (node, neighbors[1])])
                    nodes_to_remove.append(node)
                    merged = True
            graph.remove_edges_from(edges_to_remove)
            graph.remove_nodes_from(nodes_to_remove)

    def filter_street_data(gdf):
        if 'objektart' in gdf.columns:
            gdf = gdf[~gdf['objektart'].isin(UNWANTED_OBJEKTART)]
        if 'wanderweg' in gdf.columns:
            gdf = gdf[~gdf['wanderweg'].isin(UNWANTED_WANDERWEG)]
        if 'verkehrsbeschraenkung' in gdf.columns:
            gdf = gdf[~gdf['verkehrsbeschraenkung'].isin(UNWANTED_VERKEHRSBESCHRAENKUNG)]
        if 'belagsart' in gdf.columns:
            gdf = gdf[~gdf['belagsart'].isin(UNWANTED_BELAGSART)]
        return gdf

    def build_graph(roads):
        G = nx.MultiGraph()
        points = []
        for _, row in roads.iterrows():
            geom = make_valid(row.geometry)
            if isinstance(geom, LineString) and len(geom.coords) >= 2:
                coords = list(geom.coords)
                def snap_point(pt):
                    if not points:
                        points.append(pt)
                        return pt
                    tree = cKDTree(points)
                    dist, idx = tree.query(pt, k=1)
                    if dist <= SNAP_TOLERANCE:
                        return points[idx]
                    else:
                        points.append(pt)
                        return pt
                prev_point = snap_point(coords[0][:2])
                G.add_node(prev_point, x=prev_point[0], y=prev_point[1])
                for point in coords[1:]:
                    current_point = snap_point(point[:2])
                    G.add_node(current_point, x=current_point[0], y=current_point[1])
                    segment = LineString([prev_point, current_point])
                    G.add_edge(prev_point, current_point, weight=round(segment.length), geometry=segment)
                    prev_point = current_point
        return G

    def remove_disconnected_components(graph, min_nodes=3):
        components = list(nx.connected_components(graph))
        for component in components:
            if len(component) < min_nodes:
                graph.remove_nodes_from(component)
        return graph

    def clean_graph(graph):
        graph = remove_disconnected_components(graph)
        merge_straight_segments(graph)
        graph = remove_disconnected_components(graph)
        return graph

    def create_graph(gdf, polygon):
        buffer = polygon.buffer(50)
        current_roads = gdf[gdf.intersects(buffer)]
        graph = build_graph(current_roads)
        graph = clean_graph(graph)
        return graph

    gdf = gpd.read_file(input_gpkg, layer="tlm_strassen_strasse")
    gdf = filter_street_data(gdf)
    with open(input_json, "r") as f:
        polygon_data = json.load(f)
        coords = polygon_data["perimeter"]
        polygon = Polygon(coords)

    polygon = gpd.GeoSeries([polygon], crs="EPSG:4326").to_crs("EPSG:2056").union_all()

    graph = create_graph(gdf, polygon)
    return graph


def generate_chinese_postman_coordinates(graph, start_node_coord):
    def chinese_postman(graph, start_node=None):
        odd_nodes = [n for n, d in graph.degree() if d % 2 != 0]
        path_lengths = dict(nx.all_pairs_dijkstra_path_length(graph, weight='weight'))
        path_dict = dict(nx.all_pairs_dijkstra_path(graph, weight='weight'))

        G_matching = nx.Graph()
        for i, u in enumerate(odd_nodes):
            for v in odd_nodes[i + 1:]:
                if v in path_lengths[u]:
                    G_matching.add_edge(u, v, weight=path_lengths[u][v])

        matching = list(nx.algorithms.matching.min_weight_matching(G_matching))
        edge_usage = Counter()
        for u, v in matching:
            path = path_dict[u][v]
            for i in range(len(path) - 1):
                edge = tuple(sorted((path[i], path[i + 1])))
                edge_usage[edge] += 1

        for u, v in graph.edges():
            edge = tuple(sorted((u, v)))
            edge_usage[edge] += 1

        circuit = []
        stack = [start_node if start_node else next(iter(graph.nodes))]
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
        return circuit

    start_node = min(graph.nodes, key=lambda n: (n[0] - start_node_coord[0])**2 + (n[1] - start_node_coord[1])**2)
    circuit = chinese_postman(graph, start_node=start_node)

    transformer = pyproj.Transformer.from_crs("EPSG:2056", "EPSG:4326", always_xy=True)
    coordinates = []
    for node in circuit:
        x = graph.nodes[node]['x']
        y = graph.nodes[node]['y']
        lon, lat = transformer.transform(x, y)
        coordinates.append([lon, lat])
    return coordinates

def haversine(coord1, coord2):
    lon1, lat1 = coord1
    lon2, lat2 = coord2
    R = 6371000
    dlon = radians(lon2 - lon1)
    dlat = radians(lat2 - lat1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return R * c


def filter_nearby_coordinates(coords, min_dist=10):
    filtered = []
    for c in coords:
        if all(haversine(c, f) >= min_dist for f in filtered):
            filtered.append(c)
    return filtered


def try_sources_to_targets(sources, targets, last_costing):
    body = {"sources": sources, "targets": targets, "costing": last_costing}
    try:
        response = requests.post(f"{VALHALLA_URL}/sources_to_targets", json=body)
        response.raise_for_status()
        return response.json(), "auto"
    except requests.exceptions.HTTPError as e:
        if response.status_code == 400 and last_costing == "auto":
            print(f"Kein Auto-Routing möglich → Versuche Fußweg bei {sources[0]}")
            body["costing"] = "pedestrian"
            try:
                response = requests.post(f"{VALHALLA_URL}/sources_to_targets", json=body)
                response.raise_for_status()
                return response.json(), "pedestrian"
            except Exception as e:
                print(f"Auch pedestrian fehlgeschlagen: {e}")
                return None, "auto"
        else:
            print(f"Fehler bei Valhalla: {e}")
            return None, "auto"


def build_dist_matrix(coords, batch_size=50, max_workers=25):
    n = len(coords)
    dist_matrix = np.full((n, n), np.inf)

    def fetch_distances(i):
        row = np.full(n, np.inf)
        coord_from = coords[i]
        sources = [{"lat": coord_from[1], "lon": coord_from[0]}]
        current_costing = "auto"

        for batch_start in range(0, n, batch_size):
            batch_coords = coords[batch_start:batch_start + batch_size]
            targets = [{"lat": c[1], "lon": c[0]} for c in batch_coords]

            results, current_costing = try_sources_to_targets(sources, targets, current_costing)
            if results is None:
                continue

            for j, res in enumerate(results["sources_to_targets"]):
                absolute_index = batch_start + j
                if isinstance(res, dict) and "distance" in res:
                    row[absolute_index] = res["distance"]

        return i, row

    print(f"→ Starte parallele Distanzberechnung mit {max_workers} Threads...")
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(fetch_distances, i) for i in range(n)]
        for future in tqdm(as_completed(futures), total=n, desc="Matrix-Fortschritt"):
            i, row = future.result()
            dist_matrix[i] = row

    return dist_matrix


def solve_tsp(dist_matrix):
    manager = pywrapcp.RoutingIndexManager(len(dist_matrix), 1, 0)
    routing = pywrapcp.RoutingModel(manager)
    def distance_callback(from_idx, to_idx):
        return int(dist_matrix[manager.IndexToNode(from_idx)][manager.IndexToNode(to_idx)] * 1000)
    transit_callback_idx = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_idx)
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    solution = routing.SolveWithParameters(search_parameters)
    if not solution:
        raise Exception("Keine Lösung für das TSP gefunden.")
    index = routing.Start(0)
    route = []
    while not routing.IsEnd(index):
        route.append(manager.IndexToNode(index))
        index = solution.Value(routing.NextVar(index))
    route.append(route[0])
    return route


def decode_polyline6(encoded):
    import polyline
    return [[lon, lat] for lat, lon in polyline.decode(encoded, 6)]


def get_valhalla_route_chunked(coords, order, chunk_size=100, output_dir="output"):
    all_coords = [coords[i] for i in order]
    chunks = [all_coords[i:i+chunk_size] for i in range(0, len(all_coords), chunk_size - 1)]
    full_routes = []

    for idx, chunk in enumerate(chunks):
        if idx > 0:
            chunk = [chunks[idx-1][-1]] + chunk

        locations = []
        for i, (lon, lat) in enumerate(chunk):
            loc_type = "break" if i == 0 else "break"
            locations.append({"lat": lat, "lon": lon, "type": loc_type})

        costing = "auto"

        body = {
            "locations": locations,
            "costing": costing,
            "directions_options": {"units": "kilometers", "language": "de-DE"},
        }

        try:
            response = requests.post(f"{VALHALLA_URL}/route", json=body)
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 400:
                print(f"Chunk {idx+1}: auto fehlgeschlagen → versuche pedestrian")
                body["costing"] = "pedestrian"
                response = requests.post(f"{VALHALLA_URL}/route", json=body)
                response.raise_for_status()
                data = response.json()
            else:
                raise e

        full_routes.append(data)

        # Speichern der JSON-Daten
        json_path = os.path.join(output_dir, f"route_data_part_{idx + 1}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

        # Speichern der GeoJSON-Datei
        geojson_path = os.path.join(output_dir, f"route_part_{idx + 1}.geojson")
        save_geojson(data, geojson_path)


    return full_routes


def save_geojson(valhalla_json, filename="route.geojson"):
    if "trip" in valhalla_json:
        shape = valhalla_json["trip"]["legs"]
    elif "routes" in valhalla_json:
        shape = valhalla_json["routes"][0]["legs"]
    else:
        print(f"Kein Shape für {filename}")
        return

    features = []
    for leg in shape:
        coords = decode_polyline6(leg["shape"])
        features.append({
            "type": "Feature",
            "geometry": {"type": "LineString", "coordinates": coords},
            "properties": {}
        })

    geojson = {"type": "FeatureCollection", "features": features}
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2)
    print(f"Teilroute gespeichert als {filename}")



def save_route_with_directions(valhalla_routes, filename="navigation.geojson"):
    import polyline
    features = []
    step_counter = 0

    for route in valhalla_routes:
        legs = route.get("trip", {}).get("legs", [])
        for leg in legs:
            maneuvers = leg.get("maneuvers", [])
            for m in maneuvers:
                if "shape" not in m:
                    continue
                if m.get("type") in [4, 5]:  # Überspringe Typen 4 = continue, 5 = merge
                    continue
                coords = polyline.decode(m["shape"], 6)
                coords = [[lon, lat] for lat, lon in coords]
                features.append({
                    "type": "Feature",
                    "geometry": {"type": "LineString", "coordinates": coords},
                    "properties": {
                        "step": step_counter,
                        "instruction": m.get("instruction", ""),
                        "length_km": m.get("length", 0),
                        "type": m.get("type", ""),
                        "begin_heading": m.get("begin_heading"),
                        "end_heading": m.get("end_heading")
                    }
                })
                step_counter += 1

    geojson = {"type": "FeatureCollection", "features": features}
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2)
    print(f"Navigation gespeichert als {filename}")

def save_navigation_geojson_from_shape_indices(valhalla_routes, filename="navigation.geojson"):
    import polyline
    features = []
    step_counter = 0

    for route in valhalla_routes:
        legs = route.get("trip", {}).get("legs", [])
        for leg in legs:
            full_shape = polyline.decode(leg.get("shape"), 6)  # ganze Linie
            maneuvers = leg.get("maneuvers", [])

            for m in maneuvers:
                if m.get("type") in [4, 5]:  # optional überspringen
                    continue

                start_idx = m.get("begin_shape_index")
                end_idx = m.get("end_shape_index")
                coords = full_shape[start_idx:end_idx + 1]

                features.append({
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [[lon, lat] for lat, lon in coords]
                    },
                    "properties": {
                        "step": step_counter,
                        "instruction": m.get("instruction", ""),
                        "verbal_pre": m.get("verbal_pre_transition_instruction", ""),
                        "verbal_post": m.get("verbal_post_transition_instruction", ""),
                        "length_km": m.get("length", 0),
                        "type": m.get("type", ""),
                        "street_names": m.get("street_names", []),
                        "time_sec": m.get("time", 0),
                    }
                })
                step_counter += 1

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2)

    print(f"Navigation gespeichert als {filename}")


def save_trace_route_json(valhalla_routes, filename="trace_route.json"):
    import polyline
    instructions = []

    for route in valhalla_routes:
        legs = route.get("trip", {}).get("legs", [])
        step_counter = 0
        for leg in legs:
            maneuvers = leg.get("maneuvers", [])
            for m in maneuvers:
                if "shape" not in m:
                    continue
                coords = polyline.decode(m["shape"], 6)
                coords = [[lon, lat] for lat, lon in coords]
                instructions.append({
                    "step": step_counter,
                    "instruction": m.get("instruction", ""),
                    "length_km": m.get("length", 0),
                    "type": m.get("type", ""),
                    "geometry": coords
                })
                step_counter += 1

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(instructions, f, indent=2)
    print(f"Trace-Route gespeichert als {filename}")


def merge_geojson_parts(part_filenames, output_file="route_full.geojson"):
    features = []
    for file in part_filenames:
        with open(file, "r") as f:
            part = json.load(f)
            features.extend(part["features"])
    geojson = {"type": "FeatureCollection", "features": features}
    with open(output_file, "w") as f:
        json.dump(geojson, f, indent=2)
    print(f"Zusammengeführte Route gespeichert als {output_file}")

def run_routing(input_json, input_gpkg, start_node_coord_3857, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)
    start_node_coord = translate_start_coord(start_node_coord_3857)
    graph = prepare_graph(input_json, input_gpkg)
    print("→ Graph vorbereitet!")

    coords = generate_chinese_postman_coordinates(graph, start_node_coord)
    print(f"Ursprünglich: {len(coords)} Koordinaten")
    #coords = filter_nearby_coordinates(coords, min_dist=0.1)
    print(f"Nach Filterung: {len(coords)} Koordinaten (≥1m Abstand)")

    print("→ Distanzmatrix berechnen...")
    dist_matrix = build_dist_matrix(coords, batch_size=50, max_workers=25)

    print("→ Optimale Route lösen (TSP)...")
    route_order = solve_tsp(dist_matrix)

    print("→ Valhalla-Routen als Blöcke anfragen...")
    routes = get_valhalla_route_chunked(coords, route_order, chunk_size=100, output_dir=output_dir)

    part_files = [os.path.join(output_dir, f"route_part_{i+1}.geojson") for i in range(len(routes))]
    merge_geojson_parts(part_files, os.path.join(output_dir, "route_full.geojson"))
    save_route_with_directions(routes, os.path.join(output_dir, "navigati-on.geojson"))
    save_trace_route_json(routes, os.path.join(output_dir, "trace_route.json"))
    save_navigation_geojson_from_shape_indices(routes, os.path.join(output_dir, "navigation.geojson"))
    print("Temporäre Dateien werden gelöscht...")
    for f in part_files + routes:
        try:
            os.remove(f)
        except Exception as e:
            print(f"Fehler beim Löschen von {f}: {e}")
    print("Alle Routen erfolgreich gespeichert!")
    print("Berechnung abgeschlossen!")