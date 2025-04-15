import geopandas as gpd
from shapely.validation import make_valid
from shapely.geometry import LineString, Polygon, GeometryCollection
from tqdm import tqdm

def remove_height_data(gdf):
    print("Entferne Höheninformationen...")
    
    def remove_z(geom):
        if geom.is_empty:
            return geom
        if isinstance(geom, LineString):
            return LineString([(x, y) for x, y, *_ in geom.coords])
        elif isinstance(geom, Polygon):
            return Polygon([(x, y) for x, y, *_ in geom.exterior.coords])
        elif isinstance(geom, GeometryCollection):
            return GeometryCollection([remove_z(g) for g in geom])
        return geom

    tqdm.pandas()
    gdf.geometry = gdf.geometry.progress_apply(lambda x: remove_z(make_valid(x)))
    return gdf

def main():
    input_gpkg = "SWISSTLM3D_2025.gpkg"
    output_gpkg = "SWISSTLM3D_no_height.gpkg"
    layer_name = "tlm_strassen_strasse"

    print("Lade swissTLM3D Daten...")
    gdf = gpd.read_file(input_gpkg, layer=layer_name)

    gdf_clean = remove_height_data(gdf)

    print(f"Speichere bereinigte Daten nach {output_gpkg}...")
    gdf_clean.to_file(output_gpkg, layer=layer_name, driver="GPKG")
    print("Fertig!")

if __name__ == "__main__":
    main()