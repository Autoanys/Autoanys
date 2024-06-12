from fastapi import APIRouter, HTTPException
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
import time
import asyncio
from prisma import Prisma

router = APIRouter()

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