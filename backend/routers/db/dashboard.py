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

@router.get("/dashboard/charttwo/")
async def get_chartone_weekly():
    prisma = Prisma()
    await prisma.connect()

    # Get the current date and calculate the date 7 weeks ago
    end_date = datetime.utcnow().replace(tzinfo=None)
    start_date = end_date - timedelta(weeks=7)

    # Ensure the start date is set to the beginning of the week (Monday)
    start_date -= timedelta(days=start_date.weekday())

    # Fetch logs created in the past 7 weeks from the adjusted start_date
    logs = await prisma.logs.find_many(
        where={
            'created_at': {
                'gte': start_date,
                'lte': end_date
            }
        }
    )

    # Initialize lists with 7 zeros (one for each week)
    logs_count_per_week = [0] * 7
    success_logs_count_per_week = [0] * 7

    # Populate the lists with log counts per week
    for log in logs:
        created_at_naive = log.created_at.replace(tzinfo=None)
        week_diff = ((created_at_naive - start_date).days // 7)
        if 0 <= week_diff < 7:
            logs_count_per_week[week_diff] += 1
            if log.result == "Success":
                success_logs_count_per_week[week_diff] += 1

    await prisma.disconnect()
    return {
        "message": "Successful",
        "data": {
            "total_logs_per_week": logs_count_per_week,
            "success_logs_per_week": success_logs_count_per_week
        }
    }


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