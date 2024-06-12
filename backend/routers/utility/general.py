from fastapi import APIRouter, HTTPException
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
import time


router = APIRouter()



@router.post("/general/wait")
async def sleep_wait(jsons: dict):
    if jsons:
        seconds = int(jsons.get("wait_seconds"))
        if seconds:
            time.sleep(seconds)
            return {"message": f"Wait for {seconds} seconds"}
        else:
            raise HTTPException(status_code=404, detail="Seconds not found")
    # time.sleep(seconds)
    # return {"message": f"Slept for {seconds} seconds"}

