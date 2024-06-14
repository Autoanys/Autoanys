from fastapi import APIRouter, HTTPException
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
import time
import asyncio
from prisma import Prisma
from datetime import datetime, timedelta


router = APIRouter()

@router.get("/dashboard/overview/")
async def get_overview():
    prisma = Prisma()
    await prisma.connect()

    flow_count = await prisma.subflow.count()
    steps_count = await prisma.steplogs.count()
    steps_count_result = await prisma.steplogs.count(where={"result": {"not": "null"}})

    await prisma.disconnect()
    return {"total_workflow": f"{flow_count}", "total_steps": f"{steps_count}", "total_steps_with_result": f"{steps_count_result}"}


@router.get("/dashboard/chartone/")
async def get_chartone():
    prisma = Prisma()
    await prisma.connect()

    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=365)

    logs = await prisma.logs.find_many(
        where={
            'created_at': {
                'gte': start_date,
                'lte': end_date
            }
        }
    )

    logs_count_per_month = [0] * 13
    success_logs_count_per_month = [0] * 13

    for log in logs:
        month_diff = (end_date.year - log.created_at.year) * 12 + end_date.month - log.created_at.month
        if 0 <= month_diff < 13:
            logs_count_per_month[12 - month_diff] += 1
            if log.result == "Success":
                success_logs_count_per_month[12 - month_diff] += 1

    await prisma.disconnect()
    return {
        "message": "Successful",
        "data": {
            "total_logs_per_month": logs_count_per_month,
            "success_logs_per_month": success_logs_count_per_month
        }
    }