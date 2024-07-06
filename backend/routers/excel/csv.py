from fastapi import APIRouter, HTTPException, File, UploadFile
from PIL import Image
from pathlib import Path
from prisma import Prisma
import csv


router = APIRouter()

async def validate_csv(file):
    if file.filename.endswith(".csv"):
        return True
    else:
        return False
    
@router.post("/csv/read")
async def read_csv(profile_json: dict):
    try:
        file = profile_json.get("csv_file")
        if await validate_csv(file):
            data = await file.read()
            data = data.decode("utf-8")
            data = data.split("\n")
            data = list(csv.reader(data))
            return {"message":"successful","data": data}
        else:
            raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV file.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




@router.post("/upload/read")
def upload_read(csv_file: UploadFile = File(...)):
    print("Check", csv_file)
    try:
        # Upload to the storage folder
        save_path = f"storage/{csv_file.filename}"
        contents = csv_file.file.read()
        with open(save_path, 'wb') as f:
            f.write(contents)

        print(csv_file.filename)

        # Read the file
        data = []
        with open(save_path, 'r') as f:
            reader = csv.reader(f)
            for row in reader:
                data.append(row)
        print(data)
    except Exception as e:
        return {"message": "There was an error uploading the file", "error": str(e)}
    finally:
        csv_file.file.close()

    return {"message": f"Successfully uploaded {csv_file.filename}", "data" : data}