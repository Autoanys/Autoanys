from fastapi import APIRouter
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from prisma import Prisma
from datetime import datetime
from routers.utility import flow, general
from general.header import get_random_string
from routers.db.subflow import all_subflow,specific_subflow
from routers.utility.flow import analyze_json
from routers.db.logs import write_logging, write_step_logs
import json
import requests
from routers.chrome.browser import OpenBrowser, OpenWebsite, GetScreenshot, CloseBrowser
from routers.utility.general import sleep_wait
from general.cronValidate import validate_cron


router = APIRouter()

async def getLogJson(flowID):
    triggerID =   get_random_string(16)
    logFlowID = flowID
    type = "Scheduled"
    flow_type = "Flow"
    result = "Success"
    logData = {
    "trigger_id": triggerID,
    "flow_id": logFlowID,
    "flow_type": flow_type,
    "type": type,
    "result": result,
    }
    
    return logData

async def getLogJsonSubflow(triggerID, api, step, result):
    postD = {
        "log_id" : triggerID,
        "api": api,
        "step": step,
        "result": result

    }

    return postD

    # body: JSON.stringify({
    #               log_id: triggerID,
    #               api: data.steps[i].api,
    #               step: i + 1,
    #               result: JSON.stringify(resData),
    #             }),

def get_function_by_name(name):
    return globals().get(name)

async def run_subflow(subflow_id: str):
    print(f"Running subflow with ID: {subflow_id}")
    res = await specific_subflow(subflow_id)
    flowjson = res['data'].flowjson
    flowstep = await analyze_json(json.loads(flowjson)) 
    print("-----------------------------")
    print(flowstep['steps'])
    print("-----------------------------")

    logData = await getLogJson(subflow_id)
    log = await write_logging(logData)
    print(log)

    for idx, step in enumerate(flowstep['steps']):
        function_name = step['function']
        function = get_function_by_name(function_name)
        print(step, "Looping")

        if not function:
            print(f"Function {function_name} not found")
            continue

        if step['method'] == 'GET':
            print("call function")
            data = await function()
            logStep = await getLogJsonSubflow(logData['trigger_id'], step['api'], idx, data)
            print(data, "OK")
        elif step['method'] == 'POST':
            print("call function")
            pla_arg = json.dumps(step['post_data'])
            func_arg = json.loads(pla_arg)
            ran = await function(func_arg)
            logStep = await getLogJsonSubflow(logData['trigger_id'], step['api'], idx, ran)

    return {"message": "Subflow executed", "subflow_id": subflow_id}

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


