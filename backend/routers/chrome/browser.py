from fastapi import APIRouter, HTTPException
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
from fastapi.responses import FileResponse
from general.header import *
import random
import string
import socket
import asyncio


hostname = socket.getfqdn()
ip = socket.gethostbyname_ex(hostname)[2][1]

router = APIRouter()

@router.get("/browser")
async def browser():
    return {"message": "Hello World"}

@router.get("/browser/open")
async def OpenBrowser():
    global driver
    options = Options()
    options.headless = True
    driver = webdriver.Chrome(options=options)
    return {"message": "Browser Opened"}

@router.post("/browser/access")
async def OpenWebsite(json: dict):
    try:
        imageFile = get_random_string(12)+".png"
        #imageFile = string.ascii_letters + str(random.randint(0, 1000)) + ".png"
        print(json)
        if "website_url" in json:
            url = json["website_url"]
            if not url.startswith("http"):
                driver.get("https://"+url)
                driver.save_screenshot("storage/"+imageFile)
            else:
                driver.get(url)
                driver.save_screenshot("storage/"+imageFile)
                
        return {"message": url+" Opened", "preview" : f"http://{ip}:8000/browser/screenshot/"+ imageFile}
    except Exception as e:
        print(e)
        return {"message": f"Error Occured {e}"}

@router.get("/browser/screenshot/{imageFile}")
async def GetScreenshot(imageFile: str):
    imageFile = Path("storage/"+imageFile)
    return FileResponse(imageFile)



@router.get("/browser/close")
async def CloseBrowser():
    driver.quit()
    return {"message": "Browser Closed"}


@router.post("/browser/findBy")
async def FindBy(xpath_data: dict):
    try:
        query = xpath_data.get("query")
        find_by = xpath_data.get("find_by")
        if query:
            print(find_by, query)
            element = driver.find_element(find_by, query)
            return {"message": "Element Found", "data": element.text}
        else:
            raise HTTPException(status_code=450, detail=f"Error, cannot allocated element, {e}")

    except Exception as e:
        raise HTTPException(status_code=450, detail=f"Error, cannot allocated element, {e}")

@router.post("/browser/type/")
async def FindByXpath(xpath_data: dict):
    type = xpath_data.get("type")
    xpath = xpath_data.get("xpath")
    imageFile = get_random_string(12)+".png"
    print(type, xpath)
    if type:
        element = driver.find_element("xpath", xpath)
        element.send_keys(type)
        driver.save_screenshot("storage/"+imageFile)
        return {"message": "Element Found", }
    else:
        return {"message": "Element Not Found"}

@router.post("/browser/findBy/click")
async def FindByXpathClick(xpath_data: dict):
    try:
        query = xpath_data.get("query")
        find_by = xpath_data.get("find_by")
        imageFile = get_random_string(12)+".png"

        if query:
            element = driver.find_element(find_by, query)
            element.click()
            driver.save_screenshot("storage/"+imageFile)
            return {"message": "Element Found and Clicked", "preview" : f"http://{ip}:8000/browser/screenshot/"+ imageFile}
        else:
            return {"message": "Element Not Found"}
    except Exception as e:
        raise HTTPException(status_code=450, detail=f"Error, cannot allocated element, {e}")
    
@router.post("/browser/findBy/type")
async def FindByXpathType(xpath_data: dict):
    try:
        query = xpath_data.get("query")
        find_by = xpath_data.get("find_by")
        imageFile = get_random_string(12)+".png"

        type = xpath_data.get("type")
        if query:
            element = driver.find_element(find_by, query)
            element.send_keys(type)
            driver.save_screenshot("storage/"+imageFile)
            return {"message": "Element Found and Typed", "preview" : f"http://{ip}:8000/browser/screenshot/"+ imageFile}
        else:
            return {"message": "Element Not Found"}
    except Exception as e:
        raise HTTPException(status_code=450, detail=f"Error, cannot allocated element, {e}")


@router.post("/browser/click/")
async def FindByXpath(xpath_data: dict):
    xpath = xpath_data.get("xpath")
    if xpath:
        element = driver.find_element("xpath", xpath)
        element.click()
        return {"message": "Element Found"}
    else:
        return {"message": "Element Not Found"}
