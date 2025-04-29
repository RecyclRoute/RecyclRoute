from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from datetime import datetime
import os
from shapely.geometry import shape
import logging
import json
from pydantic import BaseModel
from typing import List
from shapely.geometry import Polygon, mapping
from fastapi.responses import JSONResponse
import httpx



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



@app.post("/berechnen")
async def call_dummy(request: Request, project_name: str):
    try:
        # Debug: print the raw request body to see what's coming in
        request_body = await request.json()
        print(f"Received request body: {request_body}")

        point_geometry = request_body.get("point_geometry", None)

        # Ensure point_geometry is not None and has the correct structure
        if not point_geometry or 'type' not in point_geometry or 'coordinates' not in point_geometry:
            raise HTTPException(status_code=400, detail="Invalid point geometry data. Ensure 'type' and 'coordinates' are present.")
        
        print(f"Point geometry: {point_geometry}")

        # Try to convert the point geometry to a Shapely Point object
        point = shape(point_geometry)  # Convert the point geometry to a Shapely Point object

        # Fetch the project geometry from the DB (assuming this logic is working correctly)
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT ST_AsGeoJSON(perimeter) FROM project WHERE name = %s", (project_name,))
        project_row = cur.fetchone()

        if not project_row:
            raise HTTPException(status_code=404, detail=f"Project with name {project_name} not found")

        project_geometry = json.loads(project_row[0])  # Convert the GeoJSON string to a Python dict
        cur.close()
        conn.close()

        # Now send the point and polygon to the API on 7999
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:7999/dummy",
                json={"point": point_geometry, "polygon": project_geometry}
            )
            response.raise_for_status()
            return {"dummy_response": response.json()}

    except httpx.RequestError as exc:
        raise HTTPException(status_code=500, detail=f"Request error: {exc}")
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=f"HTTP error: {exc.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")