import networkx as nx
import folium
import pyproj
import pickle
from tqdm import tqdm
from shapely.geometry import LineString, shape
import geopandas as gpd
import random
import json

# Pfade
INPUT_GRAPH = "prepared_graph.pkl"
OUTPUT_HTML = "graph_debug_view.html"
INPUT_GEOJSON = "polygon_project.geojson"

# Hier optional: Dein Polygon definieren
def get_analysis_polygon():
    # Lade GeoJSON-Datei
    with open(INPUT_GEOJSON, "r") as f:
        geojson_data = json.load(f)

    # Extrahiere Geometrie aus der ersten Feature
    geometry = shape(geojson_data['features'][0]['geometry'])

    # In Ziel-Koordinatensystem umprojizieren
    gdf = gpd.GeoSeries(geometry, crs="EPSG:4326").to_crs("EPSG:2056")

    return gdf.iloc[0]


def get_component_colors(graph):
    components = list(nx.connected_components(graph))
    color_map = {}
    palette = [
        'red', 'blue', 'green', 'purple', 'orange', 'darkred', 'lightred',
        'beige', 'darkblue', 'darkgreen', 'cadetblue', 'darkpurple',
        'white', 'pink', 'lightblue', 'lightgreen', 'gray', 'black'
    ]
    random.shuffle(palette)

    component_stats = {}

    for idx, component in enumerate(components):
        color = palette[idx % len(palette)]
        num_nodes = len(component)
        num_edges = sum(1 for u, v in graph.edges() if u in component)
        component_stats[idx] = {'nodes': num_nodes, 'edges': num_edges}

        for node in component:
            color_map[node] = color

    print(f"\nGraph besteht aus {len(components)} Komponenten.")
    print("🧩 Komponentenübersicht:")
    for idx, stats in component_stats.items():
        print(f"  Komponente {idx}: {stats['nodes']} Knoten, {stats['edges']} Kanten")

    return color_map



def visualize_graph(graph, polygon):
    print("Visualisiere kompletten Graphen inklusive Komponenten...")

    transformer = pyproj.Transformer.from_crs("EPSG:2056", "EPSG:4326", always_xy=True)

    # Berechne Mittelpunkt des Analyse-Polygons
    centroid_x, centroid_y = polygon.centroid.coords[0]
    center_lon, center_lat = transformer.transform(centroid_x, centroid_y)

    # Erstelle Karte zentriert auf das Analyse-Polygon
    m = folium.Map(location=[center_lat, center_lon], zoom_start=15, tiles='CartoDB positron', crs='EPSG3857')

    # Zeichne Analyse-Polygon
    if polygon:
        polygon_coords = list(polygon.exterior.coords)
        polygon_latlon = [transformer.transform(x, y) for x, y in polygon_coords]
        polygon_latlon = [(lat, lon) for lon, lat in polygon_latlon]
        folium.Polygon(locations=polygon_latlon, color='blue', fill=True, fill_opacity=0.1, tooltip="Analysebereich").add_to(m)

    # Farbkodierung für Komponenten
    color_map = get_component_colors(graph)

    # Zeichne alle Kanten, farblich nach Komponente
    for u, v, data in tqdm(graph.edges(data=True), desc="Kanten visualisieren"):
        if 'geometry' in data and isinstance(data['geometry'], LineString):
            coords = list(data['geometry'].coords)
            transformed = [transformer.transform(x, y) for x, y in coords]
            color = color_map.get(u, 'gray')
            folium.PolyLine([(lat, lon) for lon, lat in transformed], color=color, weight=3, opacity=0.6).add_to(m)

    # Markiere ungerade Knoten
    odd_nodes = [n for n, d in graph.degree() if d % 2 != 0]
    for node in odd_nodes:
        x, y = node
        lon, lat = transformer.transform(x, y)
        folium.CircleMarker(
            location=[lat, lon],
            radius=4,
            color='red',
            fill=True,
            fill_opacity=1,
            tooltip=f"Ungerader Knoten: {node}"
        ).add_to(m)

    m.save(OUTPUT_HTML)
    print(f"Visualisierung gespeichert als {OUTPUT_HTML}")


def main():
    print("Lade Graph...")

    with open(INPUT_GRAPH, "rb") as f:
        graph = pickle.load(f)

    polygon = get_analysis_polygon()

    visualize_graph(graph, polygon)


if __name__ == "__main__":
    main()