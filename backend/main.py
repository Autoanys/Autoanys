from fastapi import FastAPI
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
from routers.db import subflow, logs, dashboard, plugins,components
from routers.ssh import ssh
from routers.mail import mail
from routers.excel import csv

app = FastAPI()

# Combine all routers
builtIn_list = [browser, flow,
                components, general, query, subflow, logs, dashboard, plugins, ssh, mail, csv]
for router in builtIn_list:
    app.include_router(router.router)


# Set up CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the AutoAnys api service. Please use the /docs endpoint to see the available endpoints."}
