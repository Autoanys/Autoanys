from fastapi import APIRouter, HTTPException
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
import time
import asyncio
from prisma import Prisma

router = APIRouter()

@router.get("/dashboard/overview/")
async def get_overview():
    prisma = Prisma()
    await prisma.connect()

    flow_count = await prisma.subflow.count()
    steps_count = await prisma.steplogs.count()
    # Count steps that result is not empty
    steps_count_result = await prisma.steplogs.count(where={"result": {"not": "null"}})
    
    # flow_data = await prisma.subflow.create(
    #     data={
    #         "flow": flow,
    #         "step": step,
    #         "result": result,
    #         "triggerID": triggerID
    #                         }
    # )
    await prisma.disconnect()
    return {"total_workflow": f"{flow_count}", "total_steps": f"{steps_count}", "total_steps_with_result": f"{steps_count_result}"}

