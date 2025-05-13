from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from psycopg2.extras import RealDictCursor
import json
import psycopg2
import psycopg2.extras
from datetime import datetime
import base64
from shapely.geometry import shape
import logging
import json
from pydantic import BaseModel
from typing import List
from shapely.geometry import Polygon, mapping
from fastapi.responses import JSONResponse
import httpx
from typing import List, Literal



# Initialize FastAPI app
#use Commmand "uvicorn server.app.main:app --reload --port 8000" to startup
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
        cursor_factory=psycopg2.extras.RealDictCursor
    )
    return conn

# Pydantic model for Point input data
class Point(BaseModel):
    name: str
    latitude: float
    longitude: float


class Project(BaseModel):
    name: str
    gemeindename: str
    datum:datetime
    perimeter: List[List[float]]

@app.get("/getPointTypes")
def get_point_types():
    return [
        "Recyclinggut falsch deponiert",
        "Recyclinggut nicht abgeholt",
        "Recyclinggut enthält Fremdstoffe",
        "Andere"
    ]


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

    points = [{"id": row[0], "name": row[1], "longitude": row[2], "latitude": row[3]} for row in rows]
    return {"points": points}

# Endpoint to get points per project from the database
from fastapi import FastAPI
from psycopg2.extras import RealDictCursor
import json

@app.get("/getPointsByProject/{project_id}")
def get_points_by_project(project_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT 
            id,
            type,
            date,
            picture,
            ST_X(geom) AS longitude,
            ST_Y(geom) AS latitude
        FROM points
        WHERE project_id = %s
    """, (project_id,))
    rows = cur.fetchall()

    cur.close()
    conn.close()

    # Bild konvertieren (falls vorhanden)
    points = []
    for row in rows:
        point = dict(row)  # wandelt RealDictRow in dict um

        if point["picture"]:
            point["picture"] = base64.b64encode(point["picture"]).decode("utf-8")
        else:
            point["picture"] = None  # explizit, falls kein Bild vorhanden

        # Optional: Datum konvertieren in ISO-Format (für saubere Anzeige im Frontend)
        if point["date"]:
            point["date"] = point["date"].isoformat()

        points.append(point)

    return {"points": points}



# Endpoint to add a new point to the database
VALID_TYPES = {"Recyclinggut falsch deponiert", "Recyclinggut nicht abgeholt", "Recyclinggut enthält Fremdstoffe", "Andere"}

@app.post("/addPointWithDetails")
async def add_point_with_details(
    project_id: int = Form(...),
    point_type: str = Form(...),
    date: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    picture: UploadFile = File(...)
):
    # Validate type
    if point_type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail="Invalid type. Must be one of: Recyclinggut falsch deponiert, Recyclinggut nicht abgeholt, Recyclinggut enthält Fremdstoffe, Andere")

    # Validate date format
    try:
        parsed_date = datetime.strptime(date, "%Y/%m/%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY/MM/DD")

    # Read image bytes
    picture_bytes = await picture.read()

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            INSERT INTO points (project_id, type, date, picture, geom)
            VALUES (%s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
            """,
            (project_id, point_type, parsed_date, psycopg2.Binary(picture_bytes), longitude, latitude)
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

# Setup logging
logging.basicConfig(level=logging.DEBUG)

@app.post("/addProject")
def add_project(project: Project):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        coords = project.perimeter
        name = project.name
        date = project.datum
        gemeindename = project.gemeindename

        logging.debug(f"Received project: {name}, {gemeindename}")
        logging.debug(f"Coordinates: {coords}")

        # Ensure polygon is closed
        if coords[0] != coords[-1]:
            coords.append(coords[0])

        # WKT format for PostGIS
        coord_str = ", ".join([f"{lon} {lat}" for lon, lat in coords])
        polygon_wkt = f"POLYGON(({coord_str}))"

        cur.execute(
            """
            INSERT INTO project (name, gemeindename, date, perimeter)
            VALUES (%s, %s, %s, ST_GeomFromText(%s, 3857))
            """,
            (name, gemeindename, date, polygon_wkt)
        )
        conn.commit()

        shapely_polygon = Polygon(coords)
        area = shapely_polygon.area

        geojson_data = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {},
                    "geometry": mapping(shapely_polygon)  # 🔁 Corrected key from "perimeter"
                }
            ]
        }

        with open("polygon.geojson", "w") as f:
            json.dump(geojson_data, f)

        cur.close()
        conn.close()

        return JSONResponse(content={
            "message": "Project added successfully",
            "area": area,
            "route": list(shapely_polygon.exterior.coords)
        })

    except Exception as e:
        logging.error(f"Error adding project: {e}")
        cur.close()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error adding project: {e}")

@app.get("/getProjects")
def get_projects():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


    try:
        cur.execute("SELECT id, name, date, gemeindename, ST_AsGeoJSON(perimeter) FROM project")
        rows = cur.fetchall()

        print("Gefundene DB-Zeilen:", rows)

        projects = []
        for row in rows:
            project = {
                "id": row["id"],
                "name": row["name"],
                "date": row["date"].isoformat() if row["date"] else None,
                "gemeindename": row["gemeindename"],
                "geometry": json.loads(row["st_asgeojson"]) if row["st_asgeojson"] else None
            }
            projects.append(project)

        return {"projects": projects}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving projects: {e}")

    finally:
        cur.close()
        conn.close()

@app.post("/berechnen")
async def call_calculate(request: Request, project_name: str):
    try:
        request_body = await request.json()
        point_geometry = request_body.get("point_geometry", None)

        if not point_geometry or 'type' not in point_geometry or 'coordinates' not in point_geometry:
            raise HTTPException(status_code=400, detail="Invalid point geometry data. Ensure 'type' and 'coordinates' are present.")

        # Fetch geometry from DB
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT ST_AsGeoJSON(perimeter), gemeindename FROM project WHERE name = %s", (project_name,))
        project_row = cur.fetchone()

        if not project_row:
            raise HTTPException(status_code=404, detail=f"Project with name {project_name} not found")

        perimeter_geojson = json.loads(project_row['st_asgeojson'])
        gemeindename = project_row['gemeindename']

        # Extract coordinates from the Polygon (assumes single-ring polygon)
        coordinates = perimeter_geojson.get("coordinates", [[]])[0]  # Outer ring

        # Ensure polygon is closed (first and last point the same)
        if coordinates[0] != coordinates[-1]:
            coordinates.append(coordinates[0])

        # Build the payload including point_geometry
        payload = {
            "name": project_name,
            "gemeindename": gemeindename,
            "perimeter": coordinates,
            "point_geometry": point_geometry  # Adding the point_geometry to the payload
        }

        cur.close()
        conn.close()

        # Send to second API
        async with httpx.AsyncClient(timeout=20000) as client:
            try:
                response = await client.post("http://localhost:7999/calculate", json=payload)
                response.raise_for_status()
                try:
                    return {"calculate_response": response.json()}
                except Exception as decode_error:
                    logging.error(f"⚠️ JSON-Fehler: {decode_error}")
                    return {"calculate_response": response.text}
                logging.error(f"❌ HTTP-Fehler von 7999: {exc.response.status_code} – {exc.response.text}")
                raise HTTPException(status_code=exc.response.status_code, detail=f"HTTP error: {exc.response.text}")
            except httpx.RequestError as exc:
                logging.error(f"❌ Request-Fehler zu 7999: {exc}")
                raise HTTPException(status_code=500, detail=f"Request error: {exc}")


    except httpx.RequestError as exc:
        raise HTTPException(status_code=500, detail=f"Request error: {exc}")
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=f"HTTP error: {exc.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

project_status = {}

@app.post("/notifyCalculationDone")
async def notify_calculation_done(data: dict):
    project_name = data.get("project_name")
    print(f"✔️ Berechnung für Projekt '{project_name}' erfolgreich abgeschlossen.")
    project_status[project_name] = "done"
    return {"message": "Benachrichtigung empfangen"}

@app.get("/getCalculationStatus")
def get_calculation_status(project_name: str):
    status = project_status.get(project_name, "pending")
    return {"project_name": project_name, "status": status}

@app.delete("/deleteProject/{project_id}")
def delete_project(project_id: int):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Prüfen, ob das Projekt existiert
        cur.execute("SELECT id FROM project WHERE id = %s", (project_id,))
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail=f"Projekt mit ID {project_id} wurde nicht gefunden.")

        # Projekt löschen (alle zugehörigen Punkte werden durch ON DELETE CASCADE entfernt)
        cur.execute("DELETE FROM project WHERE id = %s", (project_id,))
        conn.commit()

        return {"message": f"Projekt mit ID {project_id} erfolgreich gelöscht."}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Löschen des Projekts: {e}")
    
    finally:
        cur.close()
        conn.close()

