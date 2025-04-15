from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from datetime import datetime
import os
import logging
import json
from pydantic import BaseModel
from typing import List
from shapely.geometry import Polygon, mapping
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


@app.get("/getProjects")
def get_projects():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM project")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id": row[0], "name": row[1]} for row in rows]

@app.get("/getPointTypes")
def get_point_types():
    return [
        "Recyclingut falsch deponiert",
        "Recyclingut nicht abgeholt",
        "Recyclingut enthält Fremdstoffe",
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

    points = [{"id": row[0], "name": row[1], "latitude": row[2], "longitude": row[3]} for row in rows]
    return {"points": points}

# Endpoint to add a new point to the database
VALID_TYPES = {"Recyclingut falsch deponiert", "Recyclingut nicht abgeholt", "Recyclingut enthält Fremdstoffe", "Andere"}

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
        raise HTTPException(status_code=400, detail="Invalid type. Must be one of: Recyclingut falsch deponiert, Recyclingut nicht abgeholt, Recyclingut enthält Fremdstoffe, Andere")

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
        logging.debug(f"Received project data: {project}")

        # Convert perimeter coordinates to WKT string
        coord_str = ", ".join([f"{lon} {lat}" for lon, lat in project.perimeter])

        # Ensure polygon is closed
        if project.perimeter[0] != project.perimeter[-1]:
            coord_str += f", {project.perimeter[0][0]} {project.perimeter[0][1]}"

        polygon_wkt = f"POLYGON(({coord_str}))"

        # Insert into DB
        cur.execute(
            """
            INSERT INTO project (name, gemeindename, perimeter)
            VALUES (%s, %s, ST_GeomFromText(%s, 3857))
            """,
            (project.name, project.gemeindename, polygon_wkt)
        )
        conn.commit()

        # SHAPELY polygon + export to GeoJSON
        shapely_polygon = Polygon(project.perimeter)
        area = shapely_polygon.area
        coords = list(shapely_polygon.exterior.coords)

        logging.debug(f"Polygon area: {area}")
        logging.debug(f"Polygon coordinates: {coords}")

        # Export to GeoJSON
        geojson_data = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {},
                    "geometry": mapping(shapely_polygon)
                }
            ]
        }

        geojson_path = "polygon.geojson"
        with open(geojson_path, "w") as f:
            json.dump(geojson_data, f)


        cur.close()
        conn.close()

        return JSONResponse(content={
            "message": "Project added successfully",
            "area": area,
            "route": coords
        })

    except Exception as e:
        logging.error(f"Error adding project: {e}")
        cur.close()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error adding project: {e}")
    

@app.get("/getProjects")
def get_projects():
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT id, name, gemeindename, ST_AsGeoJSON(perimeter) FROM project")
        rows = cur.fetchall()

        projects = []
        for row in rows:
            project = {
                "id": row[0],
                "name": row[1],
                "gemeindename": row[2],
                "geometry": json.loads(row[3])  # Convert GeoJSON string to Python dict
            }
            projects.append(project)

        cur.close()
        conn.close()

        return {"projects": projects}

    except Exception as e:
        cur.close()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error retrieving projects: {e}")
