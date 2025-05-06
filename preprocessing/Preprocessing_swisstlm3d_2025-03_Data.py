import geopandas as gpd
from shapely.validation import make_valid
from shapely.geometry import LineString, Polygon, GeometryCollection
from tqdm import tqdm
import tempfile
import requests
import zipfile
import os
import shutil

# Feste Parameter
DOWNLOAD_URL = "https://data.geo.admin.ch/ch.swisstopo.swisstlm3d/swisstlm3d_2025-03/swisstlm3d_2025-03_2056_5728.gpkg.zip"
LAYER_NAME = "tlm_strassen_strasse"
OUTPUT_PATH = "client/src/data/SWISSTLM3D_no_height.gpkg"

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

def download_and_extract_gpkg(url):
    print(f"Lade ZIP-Datei herunter von: {url}")
    response = requests.get(url)
    response.raise_for_status()

    tmp_dir = tempfile.mkdtemp()
    zip_path = os.path.join(tmp_dir, "swisstlm3d.gpkg.zip")

    with open(zip_path, "wb") as f:
        f.write(response.content)

    print("Entpacke ZIP-Datei...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(tmp_dir)

    # Suche GPKG-Datei
    gpkg_files = [os.path.join(tmp_dir, f) for f in os.listdir(tmp_dir) if f.endswith(".gpkg")]
    if not gpkg_files:
        raise FileNotFoundError("Keine .gpkg-Datei im ZIP gefunden.")

    return gpkg_files[0], tmp_dir

def main():
    gpkg_path, tmp_dir = download_and_extract_gpkg(DOWNLOAD_URL)

    print(f"Lese Layer '{LAYER_NAME}' aus GPKG-Datei...")
    gdf = gpd.read_file(gpkg_path, layer=LAYER_NAME)

    gdf_clean = remove_height_data(gdf)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    print(f"Speichere bereinigte Daten nach: {OUTPUT_PATH}")
    gdf_clean.to_file(OUTPUT_PATH, layer=LAYER_NAME, driver="GPKG")

    print("Bereinigung abgeschlossen. Temporäre Dateien werden gelöscht.")
    shutil.rmtree(tmp_dir)

if __name__ == "__main__":
    main()
