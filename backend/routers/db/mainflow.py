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
from cryptography.fernet import Fernet


router = APIRouter()

# @router.post("/subflow/write/")
# async def write_subflow(flow_json: dict):
#     print(flow_json)
#     prisma = Prisma()
#     await prisma.connect()
#     description = flow_json["description"]
#     name = flow_json["name"]
#     print(name, "this is name")
#     flow = flow_json["flowjson"]
#     print("OK", name, flow)

#     flow_data = await prisma.subflow.create(
#         data={
#             "name": name,
#             "description": description,
#             "flowjson": flow
#         }
#     )
#     await prisma.disconnect()
#     return {"message": f"Sub Flow saved successfully", "data" : flow_data.id}



# @router.post("/subflow/edit/{flow_id}")
# async def edit_subflow(flow_json: dict, flow_id : str):
#     print(flow_json)
#     prisma = Prisma()
#     await prisma.connect()


#     name = flow_json["name"]
#     flow = flow_json["flowjson"]
#     description = flow_json["description"]
#     print(name, "this is name")

#     print("OK", name, flow)

#     flow_data = await prisma.subflow.update(
#         where={
#             "id": flow_id
#         },
#         data={
#             "name": name,
#             "description": description,
#             "flowjson": flow,
#             "updated_at": datetime.datetime.now() 
#         }
#     ),
#     await prisma.disconnect()
#     return {"message": f"Subflow {flow_id} updated successfully"}

# @router.get("/subflow/delete/{flow_id}")
# async def delete_subflow(flow_id : str):
#     prisma = Prisma()
#     await prisma.connect()


#     flow_data = await prisma.subflow.delete(
#         where={
#             "id": flow_id
#         }
#     ),
#     await prisma.disconnect()
#     return {"message": f"Subflow {flow_id} deleted successfully"}



@router.get("/mainflow/all/")
async def all_mainflow():
    prisma = Prisma()
    await prisma.connect()

    flow_data = await prisma.mainflow.find_many(order={
        "updated_at": "asc"
    })

    await prisma.disconnect()
    return {"message": f"All mainflow rendered", "data" : flow_data}

# @router.get("/subflow/flowid/{flow_id}")
# async def specific_subflow(flow_id : str):
#     prisma = Prisma()
#     await prisma.connect()

#     flow_data = await prisma.subflow.find_unique( where = {"id": flow_id})

#     await prisma.disconnect()
#     return {"message": f"Subflow {flow_id} rendered", "data" : flow_data}

# @router.post("/subflow/exportconfig")
# async def export_config(flow_json: dict):
#     print(flow_json)
#     jsonFileName = get_random_string(12)+".json"
#     with open("storage/" + jsonFileName, 'w') as jsonFile:
#         json.dump(flow_json, jsonFile)
    
#     return {"message": "Exported successfully", "filename": jsonFileName}

#     #return FileResponse("storage/" + jsonFileName, media_type='application/octet-stream', filename=jsonFileName)

# @router.get("/subflow/exportconfig/download/{jsonFileName}")
# async def download_config(jsonFileName: str):
#     return FileResponse("storage/" + jsonFileName, media_type='application/octet-stream', filename=jsonFileName)

