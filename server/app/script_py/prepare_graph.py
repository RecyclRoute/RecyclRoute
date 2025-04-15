import geopandas as gpd
import networkx as nx
from shapely.validation import make_valid
from shapely.geometry import LineString, Polygon, Point
from tqdm import tqdm
import pickle
from scipy.spatial import cKDTree
import numpy as np
import math

# Pfade
INPUT_GEOJSON = "polygon_project.geojson"
INPUT_GPKG = "SWISSTLM3D_no_height.gpkg"
OUTPUT_GRAPH = "prepared_graph.pkl"
LAYER_NAME = "tlm_strassen_strasse"

# Filterkriterien
UNWANTED_OBJEKTART = ['Ausfahrt', 'Einfahrt', 'Autobahn', 'Raststaette', 'Zufahrt',
                      'Dienstzufahrt', 'Autozug', 'Faehre', '1m Weg', '1m Wegfragment',
                      '2m Wegfragment', 'Markierte Spur', 'Autostrasse', 'Klettersteig', 'Provisorium']

UNWANTED_WANDERWEG = ['Wanderweg', 'Bergwanderweg', 'Alpinwanderweg', 'andere']

UNWANTED_VERKEHRSBESCHRAENKUNG = ['Allgemeines Fahrverbot', 'Fussweg', 'Fussgängerzone', 'Gebuehrenpflichtig',
                                  'Gesicherte Kletterpartie', 'Militaerstrasse', 'Radweg', 'Radweg und Fussweg',
                                  'Reitweg', 'Reitweg und Fussweg', 'Rennstrecke', 'Panzerpiste', 'Teststrecke',
                                  'Allgemeine Verkehrsbeschraenkung', 'Gesperrt']

UNWANTED_BELAGSART = ['Natur']

SNAP_TOLERANCE = 0.5  # Meter
ANGLE_THRESHOLD = 170  # Grad


def calculate_angle(p1, p2, p3):
    def vector(a, b):
        return (b[0] - a[0], b[1] - a[1])

    v1 = vector(p2, p1)
    v2 = vector(p2, p3)

    dot_product = v1[0] * v2[0] + v1[1] * v2[1]
    mag_v1 = math.hypot(*v1)
    mag_v2 = math.hypot(*v2)

    if mag_v1 == 0 or mag_v2 == 0:
        return 0

    cos_angle = dot_product / (mag_v1 * mag_v2)
    cos_angle = max(min(cos_angle, 1), -1)
    angle = math.degrees(math.acos(cos_angle))

    return angle


def merge_straight_segments(graph):
    print("Merge von geraden Segmenten mit vollständiger Geometrie...")

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

                if coords1[-1] == coords2[0]:
                    merged_coords = coords1 + coords2[1:]
                elif coords1[0] == coords2[0]:
                    merged_coords = list(reversed(coords1)) + coords2[1:]
                elif coords1[-1] == coords2[-1]:
                    merged_coords = coords1 + list(reversed(coords2))[1:]
                elif coords1[0] == coords2[-1]:
                    merged_coords = list(reversed(coords2)) + coords1[1:]
                else:
                    merged_coords = coords1 + coords2[1:]

                new_geom = LineString(merged_coords)
                total_weight = data1['weight'] + data2['weight']

                graph.add_edge(neighbors[0], neighbors[1],
                               weight=total_weight,
                               geometry=new_geom,
                               original_road=True)

                edges_to_remove.append((node, neighbors[0]))
                edges_to_remove.append((node, neighbors[1]))

                nodes_to_remove.append(node)
                merged = True

        graph.remove_edges_from(edges_to_remove)
        graph.remove_nodes_from(nodes_to_remove)

    print(f"Merge abgeschlossen. Entfernte Knoten: {len(nodes_to_remove)}")


def filter_street_data(gdf):
    print("Filtere swissTLM3D Daten...")

    if 'objektart' in gdf.columns:
        gdf = gdf[~gdf['objektart'].isin(UNWANTED_OBJEKTART)]
    if 'wanderweg' in gdf.columns:
        gdf = gdf[~gdf['wanderweg'].isin(UNWANTED_WANDERWEG)]
    if 'verkehrsbeschraenkung' in gdf.columns:
        gdf = gdf[~gdf['verkehrsbeschraenkung'].isin(UNWANTED_VERKEHRSBESCHRAENKUNG)]
    if 'belagsart' in gdf.columns:
        gdf = gdf[~gdf['belagsart'].isin(UNWANTED_BELAGSART)]

    return gdf


def remove_disconnected_components(graph, min_nodes=3):
    print(f"Entferne unverbundene Komponenten mit weniger als {min_nodes} Knoten...")

    components = list(nx.connected_components(graph))
    initial_components = len(components)
    total_removed_nodes = 0

    for component in components:
        if len(component) < min_nodes:
            total_removed_nodes += len(component)
            graph.remove_nodes_from(component)

    final_components = len(list(nx.connected_components(graph)))
    print(f"Reduziere von {initial_components} auf {final_components} Komponenten.")
    print(f"Entfernte Knoten insgesamt: {total_removed_nodes}")

    return graph


def clean_graph(graph):
    graph = remove_disconnected_components(graph, min_nodes=3)
    merge_straight_segments(graph)
    graph = remove_disconnected_components(graph, min_nodes=3)
    return graph


def create_graph(gdf, polygon, initial_buffer=50, max_expansion=5):
    print("Erstelle initialen Graph mit Snapping der Knoten...")

    def build_graph(roads):
        G = nx.MultiGraph()

        points = []
        point_map = {}

        for _, row in roads.iterrows():
            geom = make_valid(row.geometry)
            if isinstance(geom, LineString) and len(geom.coords) >= 2:
                coords = list(geom.coords)

                def snap_point(pt):
                    if not points:
                        points.append(pt)
                        point_map[pt] = pt
                        return pt

                    tree = cKDTree(points)
                    dist, idx = tree.query(pt, k=1)

                    if dist <= SNAP_TOLERANCE:
                        snapped = points[idx]
                        return snapped
                    else:
                        points.append(pt)
                        point_map[pt] = pt
                        return pt

                prev_point = snap_point(coords[0][:2])
                G.add_node(prev_point, x=prev_point[0], y=prev_point[1])

                for point in coords[1:]:
                    current_point = snap_point(point[:2])
                    G.add_node(current_point, x=current_point[0], y=current_point[1])

                    segment = LineString([prev_point, current_point])

                    G.add_edge(prev_point, current_point,
                               weight=round(segment.length),
                               geometry=segment,
                               original_road=True)

                    prev_point = current_point

        return G

    search_area = polygon.buffer(initial_buffer)
    current_roads = gdf[gdf.intersects(search_area)]

    graph = build_graph(current_roads)
    graph = clean_graph(graph)

    expansion_step = 1
    while not nx.is_connected(graph):
        expansion_step += 1
        if expansion_step > max_expansion:
            print("⚠️ Maximale Expansion erreicht, Graph bleibt unverbunden.")
            break

        buffer = initial_buffer + expansion_step * 40
        print(f"Graph nicht verbunden, erweitere Suchbereich auf {buffer} Meter...")

        expanded_area = polygon.buffer(buffer)
        current_roads = gdf[gdf.intersects(expanded_area)]
        graph = build_graph(current_roads)
        graph = clean_graph(graph)

    if nx.is_connected(graph):
        print(f"✅ Graph ist jetzt verbunden nach {expansion_step} Erweiterungsschritten.")
    else:
        print("❌ Achtung: Graph ist weiterhin nicht verbunden!")

    print(f"Graph hat {len(graph.nodes)} Knoten und {len(graph.edges)} Kanten.")
    return graph


def main():
    print("Lade bereinigte swissTLM3D-Daten...")
    gdf = gpd.read_file(INPUT_GPKG, layer=LAYER_NAME)
    gdf = filter_street_data(gdf)

    print("Lade Polygon aus GeoJSON...")
    polygon_gdf = gpd.read_file(INPUT_GEOJSON).to_crs('EPSG:2056')
    polygon = polygon_gdf.unary_union  # Falls MultiPolygon

    graph = create_graph(gdf, polygon)

    print(f"Speichere vorbereiteten Graphen nach {OUTPUT_GRAPH}...")
    with open(OUTPUT_GRAPH, "wb") as f:
        pickle.dump(graph, f)

    print("Fertig!")


if __name__ == "__main__":
    main()
