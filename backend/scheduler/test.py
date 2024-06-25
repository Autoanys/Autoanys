from fastapi import APIRouter
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from prisma import Prisma
from datetime import datetime
from routers.utility import flow, general
from routers.db.subflow import all_subflow,specific_subflow
from routers.utility.flow import analyze_json
import json
import requests
from routers.chrome.browser import OpenBrowser, OpenWebsite, GetScreenshot, CloseBrowser
from routers.utility.general import sleep_wait
from general.cronValidate import validate_cron


router = APIRouter()

# Correspondence_function_list = {
#     "OpenBrowser" : OpenBrowser,
#     "OpenWebsite" : OpenWebsite,
#     "sleep_wait" : sleep_wait,
#     "CloseBrowser" : CloseBrowser,
#     "GetScreenshot" : GetScreenshot
# }


def get_function_by_name(name):
    return globals().get(name)

# Define your subflow execution function
async def run_subflow(subflow_id: str):
    print(f"Running subflow with ID: {subflow_id}")
    res = await specific_subflow(subflow_id)
    flowjson = res['data'].flowjson
    flowstep = await analyze_json(json.loads(flowjson)) 
    print("-----------------------------")
    print(flowstep['steps'])
    print("-----------------------------")



    for step in flowstep['steps']:
        function_name = step['function']
        function = get_function_by_name(function_name)
        print(step, "Looping")

        if not function:
            print(f"Function {function_name} not found")
            continue

        if step['method'] == 'GET':
            print("call function")
            await function()
            # Function is step['function']
            # Correspondence_function_list[step['function']]
            print("done")
        elif step['method'] == 'POST':
            print("call function")
            pla_arg = json.dumps(step['post_data'])
            func_arg = json.loads(pla_arg)
            await function(func_arg)

            # await function(json.loads(step['post_data']))
            # Function is step['function']

        #     res = requests.post(step['api'], data=step['post_data'])
        #     print(res.text)


    # getFlow = await analyze_json(res.data)
    # print(getFlow)
    return {"message": "Subflow executed", "subflow_id": subflow_id}
    # subflow = await prisma.subflow.find_unique(where={'id': subflow_id})
    # if subflow and subflow.active:
    #     print(f"Running subflow: {subflow_id} at {datetime.utcnow()}")

# Function to schedule all active subflows
async def schedule_subflows(scheduler: AsyncIOScheduler, prisma: Prisma):
    print("Scheduling subflows...")
    subflows = await prisma.subflow.find_many(where={'active': True, 'schueleType': 'Auto'})
    for subflow in subflows:
        if validate_cron(subflow.schedule):
            scheduler.add_job(
                run_subflow,
                CronTrigger.from_crontab(subflow.schedule),
                args=[subflow.id],
                id=subflow.id
            )
    print(subflows)
    print(scheduler.get_jobs())


# Endpoint to add or update a subflow and reschedule
# @router.post("/subflow")
# async def add_or_update_subflow(subflow: dict):
#     subflow_id = subflow.get('id')
#     if subflow_id:
#         await prisma.subflow.update(where={'id': subflow_id}, data=subflow)
#     else:
#         subflow = await prisma.subflow.create(data=subflow)
#         subflow_id = subflow.id
    
#     # Remove the old job if it exists
#     try:
#         scheduler.remove_job(subflow_id)
#     except:
#         pass

#     # Reschedule if active and Auto
#     if subflow.get('active') and subflow.get('schueleType') == 'Auto':
#         scheduler.add_job(
#             run_subflow,
#             CronTrigger.from_crontab(subflow.get('schedule')),
#             args=[subflow_id],
#             id=subflow_id
#         )
#     return {"message": "Subflow scheduled", "subflow_id": subflow_id}

# # Endpoint to list all subflows
# @router.get("/subflows")
# async def get_subflows():
#     return await prisma.subflow.find_many()
