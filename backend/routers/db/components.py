from fastapi import APIRouter, HTTPException
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
import time
import asyncio
from prisma import Prisma
import ast
import subprocess
import tempfile
from fastapi import FastAPI
from pydantic import BaseModel

router = APIRouter()

class CodePayload(BaseModel):
    component_coding: str

def validate_code(code):
    try:
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.py', delete=False) as temp_file:
            temp_file.write(code)
            temp_file.flush()
            process = subprocess.run(
                ['python', temp_file.name],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            if process.returncode != 0:
                return False, process.stderr
            return True, process.stdout
    except Exception as e:
        return False, str(e)
    
@router.post("/components/create")
async def save_component(json_data: dict):
    # print(json_data)
    try:
        prisma = Prisma()
        await prisma.connect()
        component_name = json_data["component_name"]
        component_category = json_data["component_category"]
        component_description = json_data["component_description"]
        component_coding = json_data["component_coding"]
        component = await prisma.component.create(
            data={
                "name": component_name,
                "category": component_category,
                "description": component_description,
                "coding": component_coding
            }
        )
        print(json_data)
        await prisma.disconnect()
    
        return {"message": f"{component} saved successfully"}
    except Exception as e:
        return {"message": f"Error: {e}"}


@router.get("/components/componentID/{component_id}")
async def get_component(component_id: str):
    try:
        prisma = Prisma()
        await prisma.connect()
        component = await prisma.component.find_unique(where={"id": component_id})
        await prisma.disconnect()
    
        return component
    except Exception as e:
        return {"message": f"Error: {e}"}
    
@router.get("/components/all/")
async def get_all_components():
    try:
        prisma = Prisma()
        await prisma.connect()
        components = await prisma.component.find_many()
        await prisma.disconnect()
    
        return {"message": "Sucessfully", "data": components}
    except Exception as e:
        return {"message": f"Error: {e}"}
    
@router.post("/components/validate")
async def validate_component(payload: CodePayload):
    code = payload.component_coding
    is_valid, message = validate_code(code)
    if is_valid:
        print("Valid")
        return {"message": "Code is valid", "output": message}
    else:
        print("NOT Valid")

        return {"message": "Code is invalid", "error": message}