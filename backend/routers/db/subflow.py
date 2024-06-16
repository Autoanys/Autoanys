from fastapi import APIRouter, HTTPException
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
import time
import asyncio
from prisma import Prisma
import datetime

router = APIRouter()

@router.post("/subflow/write/")
async def write_subflow(flow_json: dict):
    print(flow_json)
    prisma = Prisma()
    await prisma.connect()
    description = flow_json["description"]
    name = flow_json["name"]
    print(name, "this is name")
    flow = flow_json["flowjson"]
    print("OK", name, flow)

    flow_data = await prisma.subflow.create(
        data={
            "name": name,
            "description": description,
            "flowjson": flow
        }
    )
    await prisma.disconnect()
    return {"message": f"Sub Flow saved successfully", "data" : flow_data.id}


@router.post("/subflow/edit/{flow_id}")
async def edit_subflow(flow_json: dict, flow_id : str):
    print(flow_json)
    prisma = Prisma()
    await prisma.connect()


    name = flow_json["name"]
    flow = flow_json["flowjson"]
    description = flow_json["description"]
    print(name, "this is name")

    print("OK", name, flow)

    flow_data = await prisma.subflow.update(
        where={
            "id": flow_id
        },
        data={
            "name": name,
            "description": description,
            "flowjson": flow,
            "updated_at": datetime.datetime.now() 
        }
    ),
    await prisma.disconnect()
    return {"message": f"Slept for OK seconds"}

@router.get("/subflow/delete/{flow_id}")
async def delete_subflow(flow_id : str):
    prisma = Prisma()
    await prisma.connect()


    flow_data = await prisma.subflow.delete(
        where={
            "id": flow_id
        }
    ),
    await prisma.disconnect()
    return {"message": f"Slept for OK seconds"}



@router.get("/subflow/all/")
async def all_subflow():
    prisma = Prisma()
    await prisma.connect()

    flow_data = await prisma.subflow.find_many()

    await prisma.disconnect()
    return {"message": f"Slept for OK seconds", "data" : flow_data}

@router.get("/subflow/flowid/{flow_id}")
async def all_subflow(flow_id : str):
    prisma = Prisma()
    await prisma.connect()

    flow_data = await prisma.subflow.find_unique( where = {"id": flow_id})

    await prisma.disconnect()
    return {"message": f"Slept for OK seconds", "data" : flow_data}

