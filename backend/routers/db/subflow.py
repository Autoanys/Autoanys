from fastapi import APIRouter, HTTPException
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
import time
from prisma import Prisma
import datetime
from fastapi.responses import FileResponse
import json
from general.header import *
from general.cronValidate import validate_cron
from cryptography.fernet import Fernet
import main
from cron_validator import CronValidator


router = APIRouter()

@router.get("/ttt")
async def ttt():
    t = main.update_scheduler()
    print(t)
    return {"message": "Hello World"}

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



    # update_scheduler()
    await prisma.disconnect()
    return {"message": f"Sub Flow saved successfully", "data" : flow_data.id}


@router.get("/subflow/active/{flow_id}")
async def activate_subflow(flow_id : str):
    prisma = Prisma()
    await prisma.connect()
    orginal_flow = await prisma.subflow.find_unique(where={
        "id": flow_id
    })

    switch = False if orginal_flow.active else True
    activation = "activated" if switch else "deactivated"
    flow_data = await prisma.subflow.update(
        where={
            "id": flow_id
        },
        data={
            "active": switch
        }
    )
    aStatus = ""

    if switch == True and flow_data.schueleType == 'Auto' and await validate_cron(flow_data.schedule):
        print("Actived")
        # main.remove_subflow_scheduler(flow_id)
        main.add_subflow_scheduler(flow_id, flow_data.schedule)
    else:
        try:
            print(await validate_cron(flow_data.schedule))
            print("Why")
            print("Removed")
            main.remove_subflow_scheduler(flow_id)
        except:
            pass
    main.checkJobs()
    await prisma.disconnect()
    return {"message": f"Subflow {flow_id} {activation} successfully"}


@router.post("/subflow/scheduleType/set/")
async def scheduler_subflow(json_data: dict):
    flow_id = json_data["flow_id"]
    schedule = json_data["scheduleType"]
    print(flow_id)

    prisma = Prisma()
    await prisma.connect()


    flow_data = await prisma.subflow.update(
        where={
            "id": flow_id
        },
        data={
            "schueleType": schedule
        }
    )
    if flow_data.active == True and flow_data.schueleType == 'Auto' and await validate_cron(flow_data.schedule):
        print("Actived")
        # main.remove_subflow_scheduler(flow_id)
        main.add_subflow_scheduler(flow_id, flow_data.schedule)
    else:
        try:
            print(await validate_cron(flow_data.schedule))
            main.remove_subflow_scheduler(flow_id)
        except:
            pass

    main.checkJobs()
    await prisma.disconnect()
    return {"message": f"Flow {flow_id} schedule config successfully"}


@router.post("/subflow/scheduler/set/")
async def scheduler_subflow(json_data: dict):
    flow_id = json_data["flow_id"]
    schedule = json_data["schedule"]
    print(flow_id)

    prisma = Prisma()
    await prisma.connect()


    flow_data = await prisma.subflow.update(
        where={
            "id": flow_id
        },
        data={
            "schedule": schedule
        }
    )
    if flow_data.active == True and flow_data.schueleType == 'Auto' and await validate_cron(flow_data.schedule):
        print("Actived")
        # main.remove_subflow_scheduler(flow_id)
        main.add_subflow_scheduler(flow_id, flow_data.schedule)
    else:
        try:
            print("Removed")
            main.remove_subflow_scheduler(flow_id)
        except:
            pass
        
    main.checkJobs()
    await prisma.disconnect()
    return {"message": f"Flow {flow_id} schedule config successfully"}


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
    return {"message": f"Subflow {flow_id} updated successfully"}

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
    return {"message": f"Subflow {flow_id} deleted successfully"}



@router.get("/subflow/all/")
async def all_subflow():
    prisma = Prisma()
    await prisma.connect()

    flow_data = await prisma.subflow.find_many(order={
        "updated_at": "asc"
    })
    print("getting all subflow")

    await prisma.disconnect()
    return {"message": f"All subflow rendered", "data" : flow_data}

@router.get("/subflow/flowid/{flow_id}")
async def specific_subflow(flow_id : str):
    prisma = Prisma()
    await prisma.connect()

    flow_data = await prisma.subflow.find_unique( where = {"id": flow_id})

    await prisma.disconnect()
    return {"message": f"Subflow {flow_id} rendered", "data" : flow_data}

@router.post("/subflow/exportconfig")
async def export_config(flow_json: dict):
    print(flow_json)
    jsonFileName = get_random_string(12)+".json"
    with open("storage/" + jsonFileName, 'w') as jsonFile:
        json.dump(flow_json, jsonFile)
    
    return {"message": "Exported successfully", "filename": jsonFileName}

    #return FileResponse("storage/" + jsonFileName, media_type='application/octet-stream', filename=jsonFileName)

@router.get("/subflow/exportconfig/download/{jsonFileName}")
async def download_config(jsonFileName: str):
    return FileResponse("storage/" + jsonFileName, media_type='application/octet-stream', filename=jsonFileName)

