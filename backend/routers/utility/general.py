from fastapi import APIRouter, HTTPException, File, UploadFile
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
import time


router = APIRouter()

@router.post("/upload")
def upload(file: UploadFile = File(...)):
    try:
        save_path = f"storage/{file.filename}"
        contents = file.file.read()
        with open(save_path, 'wb') as f:
            f.write(contents)

        print(file.filename)
    except Exception:
        return {"message": "There was an error uploading the file"}
    finally:
        file.file.close()

    return {"message": f"Successfully uploaded {file.filename}"}


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

