import os
from fastapi import APIRouter, HTTPException
import subprocess
from subprocess import Popen,CREATE_NEW_CONSOLE


router = APIRouter()

@router.get("/cmd/open")
async def Opencmd():
    try:
        cmd = subprocess.Popen('cmd.exe /K cd /') 
        subprocess.Popen('cmd.exe /K ls')
        return {"message": "CMD Opened"}
    except Exception as e:
        raise HTTPException(status_code=404, detail="Error in opening CMD")

@router.get("/cmd/close")
async def Closecmd():
    try:
        command ='cmd'
        prog_start=Popen(command,creationflags=CREATE_NEW_CONSOLE)
        pidvalue=prog_start.pid
        #this will kill the invoked terminal
        subprocess.Popen('taskkill /F /T /PID %i' % pidvalue)
        return {"message": "CMD Opened"}
    except Exception as e:
        raise HTTPException(status_code=404, detail="Error in opening CMD")

