from fastapi import APIRouter, HTTPException
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
import time
import asyncio
from prisma import Prisma




router = APIRouter()

@router.get("/logs/deletealldata")
async def delete_all_logs():
    prisma = Prisma()
    await prisma.connect()
    await prisma.logs.delete_many()
    await prisma.disconnect()
    return {"message": "All logs deleted"}

@router.post("/logs/write/")
async def write_logging(flow_json: dict):
    prisma = Prisma()
    await prisma.connect()
    flowID = flow_json["flow_id"]
    triggerID = flow_json["trigger_id"]
    result = flow_json["result"]
    type = flow_json["type"]
    flowType = flow_json["flow_type"]

    print(result)

    flow_data = await prisma.logs.create(
        data={
            "flowID" : flowID,
            "result": result,
            "triggerID": triggerID,
            "type": type,
            "flowType": flowType
                            }
    )
    await prisma.disconnect()
    return {"log_id": f"{flow_data}"}

@router.get("/logs/failed/{triggerID}")
async def update_failed(triggerID: str):
    prisma = Prisma()
    print(triggerID)
    await prisma.connect()
    flow_data = await prisma.logs.update(
        where={
            "triggerID": triggerID
        },
        data={
            "result": "Failed"
        }
    )
    await prisma.disconnect()
    return {"log_id": f"{flow_data}"}

@router.get("/logs/all")
async def get_all_logs():
    prisma = Prisma()
    await prisma.connect()
    logs_data = await prisma.logs.find_many(order={
        "created_at": "desc"
    
    })
    await prisma.disconnect()
    return {"message": "Sucessfully", "data": logs_data}

#Get steplogs count
@router.get("/logs/step/count/")
async def get_step_logs_count():
    prisma = Prisma()
    await prisma.connect()
    step_data = await prisma.steplogs.count()
    await prisma.disconnect()
    return {"message": "Sucessfully", "data": step_data}


#model StepLogs {
#   id   String @id @default(cuid())
#   api     String
#   step  Int
#   result String
#   created_at DateTime @default(now())
#   log   Logs[]
#   logID String
# }

@router.get("/logs/test")
async def test():
    prisma = Prisma()
    await prisma.connect()
    logID = await prisma.logs.find_first(where={"triggerID": "5ae8f091f0ba6420"})
    print(logID.id)
    await prisma.disconnect()
    return {"log_id": f"{logID}"}

@router.post("/logs/step/")
async def write_step_logs(step_json: dict):
    prisma = Prisma()
    await prisma.connect()
    api = step_json["api"]
    step = step_json["step"]
    result = step_json["result"]
    tr_id = step_json["log_id"]

    logID = await prisma.logs.find_first(where={"triggerID": tr_id})

    step_data = await prisma.steplogs.create(
        data={
            "api": api,
            "step": step,
            "result": result,
            "logID": logID.id
                            }
    )
    await prisma.disconnect()
    return {"log_id": f"{step_data}"}

@router.get("/logs/step/{triggerID}")
async def get_step_logs(triggerID: str):
    prisma = Prisma()
    await prisma.connect()
    step_data = await prisma.steplogs.find_many(where={"log": {"triggerID": triggerID}})
    await prisma.disconnect()
    return {"message": "Sucessfully", "data": step_data}

def write_log(flow_json: dict):
    prisma = Prisma()
    prisma.connect()

    flow = flow_json["flow_id"]
    step = flow_json["step"]
    result = flow_json["result"]
    triggerID = flow_json["triggerID"]
    print(result)

    flow_data = prisma.logs.create(
        data={
            "flow": flow,
            "step": step,
            "result": result,
            "triggerID": triggerID
                            }
    )
    prisma.disconnect()
    return {"log_id": f"{flow_data}"}