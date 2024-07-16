from fastapi import FastAPI, Request, HTTPException
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
from fastapi.responses import FileResponse
from routers.chrome import browser
from routers.utility import flow, general
from fastapi.middleware.cors import CORSMiddleware
from routers.databases.mysql import query
from routers.db import subflow, logs, dashboard, plugins,components, mainflow
# from routers.cmd import cmd
from routers.ssh import ssh
from routers.mail import mail
from routers.excel import csv
from prisma import Prisma
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from scheduler.test import schedule_subflows , run_subflow
import threading
import asyncio
import signal
from uvicorn import Config, Server
import logging
import os

app = FastAPI()
scheduler = AsyncIOScheduler()
prisma = Prisma()

class WorkerIDFilter(logging.Filter):
    def filter(self, record):
        record.worker_id = os.getenv("WORKER_ID", "main")
        return True

builtIn_list = [browser, flow, 
                # cmd,
                components, general, query, subflow, logs, dashboard, plugins, ssh, mail, csv, mainflow]
for router in builtIn_list:
    app.include_router(router.router)

def signal_handler(sig, frame):
    print("Exiting...")
    exit(0)

def checkJobs():
    print(scheduler.print_jobs())
    return scheduler.print_jobs()



# def update_scheduler(flow_id):
#     print("Scheduling subflows...")
#     subflows =  prisma.subflow.find_unique(where={'id': flow_id})
#     for subflow in subflows:
#         scheduler.add_job(
#             run_subflow,
#             CronTrigger.from_crontab(subflow.schedule),
#             args=[subflow.id],
#             id=subflow.id
#         )
#     print(subflows)
#     print(scheduler.print_jobs())

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
loop = asyncio.new_event_loop()


def add_subflow_scheduler(flow_id, shed):
    scheduler.add_job(
        run_subflow,
        CronTrigger.from_crontab(shed),
        args=[flow_id],
        id=flow_id
    )

def remove_subflow_scheduler(flow_id):
    try:
        scheduler.remove_job(flow_id)
        print("Removed")
    except:
        pass
    

def start_scheduler():
    try:
        asyncio.set_event_loop(loop)
        loop.run_until_complete(prisma.connect())
        scheduler.start()
        loop.run_until_complete(schedule_subflows(scheduler, prisma))
        loop.run_forever()
    except asyncio.CancelledError:
        print("Scheduler task was cancelled")
    except KeyboardInterrupt:
        print("Exiting...")
    except Exception as e:
        print(e)
        exit(0)
    finally:
        try:
            # shutdown_event()
            loop.run_until_complete(loop.shutdown_asyncgens())
            loop.close()
        except Exception as e:
            loop.close()
            print(e)
        finally:
            loop.close()



@app.on_event("startup")
async def startup_event():
    if scheduler.running:
        scheduler.shutdown(wait=False)
    scheduler_thread = threading.Thread(target=start_scheduler)
    scheduler_thread.start()

@app.on_event("shutdown")
async def shutdown_event():
    loop.stop()
    scheduler.shutdown(wait=False)
    await prisma.disconnect()


@app.get("/")
async def root(request: Request):
    return {"message": "Welcome to the AutoAnys api service. Please use the /docs endpoint to see the available endpoints. Thanks", "requestFrom" : request.client.host}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_config="logging_config.json", reload=True, workers=4)