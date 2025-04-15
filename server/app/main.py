from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from pydantic import BaseModel
from typing import List
from shapely.geometry import shape, Polygon
from fastapi.responses import JSONResponse

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware to allow requests from your frontend
origins = [
    "http://localhost:3000",  # Your React app running locally
    # You can add other origins here if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows access from the frontend origin
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],  # Added DELETE here too
    allow_headers=["*"],  # Allow all headers
)

# Database connection settings
DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "gis_database"
DB_USER = "postgres"
DB_PASSWORD = "ADMIN"

# Connect to the PostgreSQL database
def get_db_connection():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
    )
    return conn

# Pydantic model for Point input data
class Point(BaseModel):
    name: str
    latitude: float
    longitude: float

# Pydantic model for Project input data
class Project(BaseModel):
    name: str
    gemeindename: str
    perimeter: List[List[float]]  # list of [lon, lat] pairs forming the polygon

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

# Endpoint to get points from the database
@app.get("/getPoints")
def get_points():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, name, ST_X(geom), ST_Y(geom) FROM points")
    rows = cur.fetchall()

    cur.close()
    conn.close()

    points = [{"id": row[0], "name": row[1], "latitude": row[2], "longitude": row[3]} for row in rows]
    return {"points": points}

# Endpoint to add a new point to the database
@app.post("/addPoint")
def add_point(point: Point):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "INSERT INTO points (name, geom) VALUES (%s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))",
            (point.name, point.longitude, point.latitude)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {"message": "Point added successfully"}
    except Exception as e:
        cur.close()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error adding point: {e}")

# Endpoint to delete a point by its ID
@app.delete("/deletePoint/{point_id}")
def delete_point(point_id: int):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM points WHERE id = %s", (point_id,))
        conn.commit()
        cur.close()
        conn.close()
        return {"message": f"Point with ID {point_id} deleted successfully"}
    except Exception as e:
        cur.close()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error deleting point: {e}")

# Endpoint to add a new project with polygon perimeter
@app.post("/addProject")
def add_project(project: Project):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Convert perimeter coordinates to WKT string
        coord_str = ", ".join([f"{lon} {lat}" for lon, lat in project.perimeter])

        # Ensure polygon is closed
        if project.perimeter[0] != project.perimeter[-1]:
            coord_str += f", {project.perimeter[0][0]} {project.perimeter[0][1]}"

        polygon_wkt = f"POLYGON(({coord_str}))"

        cur.execute(
            """
            INSERT INTO project (name, gemeindename, perimeter)
            VALUES (%s, %s, ST_GeomFromText(%s, 3857))
            """,
            (project.name, project.gemeindename, polygon_wkt)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {"message": "Project added successfully"}
    except Exception as e:
        cur.close()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error adding project: {e}")

@app.post("/calculate-route")
def calculate_route(geojson: dict):
    try:
        # Extrahiere Polygon aus GeoJSON FeatureCollection
        if not geojson or "features" not in geojson:
            raise ValueError("Ungültiges GeoJSON.")

        polygon_feature = geojson["features"][0]
        geometry = polygon_feature["geometry"]

        if geometry["type"] != "Polygon":
            raise ValueError("Nur Polygon wird unterstützt.")

        # Erzeuge Shapely-Polygon
        shapely_polygon = shape(geometry)

        # Beispiel: Gib Koordinaten + Fläche zurück
        coords = list(shapely_polygon.exterior.coords)
        flaeche = shapely_polygon.area

        # Dummy-Antwort (hier kann später echte Routenlogik rein)
        response = {
            "route_type": "demo",
            "area": flaeche,
            "used_polygon": coords
        }

        return JSONResponse(content=response)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Polygon-Fehler: {e}")
