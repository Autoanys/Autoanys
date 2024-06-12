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
    plugin_categories = await prisma.plugincategory.find_many()
    await prisma.disconnect()

    # Convert each PluginCategory object into a dictionary
    plugin_categories_dict = [
        {
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "endpoint": category.endpoint,
            "image": category.image,
            "active": category.active,
            "plugins": category.plugins  # Assuming category.plugins is a list of plugins
        }
        for category in plugin_categories
    ]

    return {"plugins": plugin_categories_dict}

