from fastapi import APIRouter, HTTPException
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
import time
import asyncio
from prisma import Prisma

router = APIRouter()

@router.get("/plugins/")
async def get_plugins_cate():
    prisma = Prisma()
    await prisma.connect()
    plugin_categories = await prisma.extensionlist.find_many()
    await prisma.disconnect()


    return {"message" : "successful", "plugins": plugin_categories}


@router.get("/plugins/active/{extensionID}")
async def update_plugin(extensionID: str):
    prisma = Prisma()
    await prisma.connect()
    orginal_extension = await prisma.extensionlist.find_unique(where={
        "id": extensionID
    })

    switch = False if orginal_extension.active else True

    new_data = await prisma.extensionlist.update(
        where={
            "id": extensionID
        },
        data={
            "active": switch
        }
    )

 
    await prisma.disconnect()
    return {"message": f"Extension {extensionID} activated successfully"}



@router.get("/plugins/actived/")
async def get_allactived():
    prisma = Prisma()
    await prisma.connect()
    plugin_categories = await prisma.extensionlist.find_many(where={
        "active": True
    })

    await prisma.disconnect()


    return {"message" : "successful", "actived": plugin_categories}