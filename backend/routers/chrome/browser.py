from fastapi import APIRouter
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

@router.get("/browser/screenshot/{imageFile}")
async def GetScreenshot(imageFile: str):
    imageFile = Path("storage/"+imageFile)
    return FileResponse(imageFile)

@router.get("/OpenGoogle")
async def OpenGoogle():
    driver.get("https://www.google.com")
    return {"message": "Google Opened"}

@router.get("/OpenTest")
async def OpenTest():
    driver.get("https://www.vicodtech.com")
    driver.save_screenshot("temp.png")
    results={"message":"Opened Test"}
    return FileResponse("temp.png", headers=results)

    #return {"message": "Google Opened"}

@router.get("/browser/close")
async def CloseBrowser():
    driver.quit()
    return {"message": "Browser Closed"}

# @router.post("/browser/findByXpath/")
# async def FindByXpath(xpath_data: dict):
#     xpath = xpath_data.get("xpath")
#     if xpath:
#         element = driver.find_element("xpath", xpath)
#         return {"message": "Element Found"}
#     else:
#         return {"message": "Element Not Found"}
    
# @router.post("/browser/findByID/")
# async def FindByXpath(xpath_data: dict):
#     xpath = xpath_data.get("d")
#     if xpath:
#         element = driver.find_element("id", xpath)
#         return {"message": "Element Found"}
#     else:
#         return {"message": "Element Not Found"}
    
# @router.post("/browser/findByName/")
# async def FindByXpath(xpath_data: dict):
#     xpath = xpath_data.get("name")
#     if xpath:
#         element = driver.find_element("name", xpath)
#         return {"message": "Element Found"}
#     else:
#         return {"message": "Element Not Found"}

@router.post("/browser/findBy")
async def FindByXpath(xpath_data: dict):
    query = xpath_data.get("query")
    find_by = xpath_data.get("find_by")
    if query:
        print(find_by, query)
        element = driver.find_element(find_by, query)
        return {"message": "Element Found", "data": element.text}
    else:
        return {"message": "Element Not Found"}

@router.post("/browser/type/")
async def FindByXpath(xpath_data: dict):
    type = xpath_data.get("type")
    xpath = xpath_data.get("xpath")
    print(type, xpath)
    if type:
        element = driver.find_element("xpath", xpath)
        element.send_keys(type)
        return {"message": "Element Found"}
    else:
        return {"message": "Element Not Found"}


@router.post("/browser/click/")
async def FindByXpath(xpath_data: dict):
    xpath = xpath_data.get("xpath")
    if xpath:
        element = driver.find_element("xpath", xpath)
        element.click()
        return {"message": "Element Found"}
    else:
        return {"message": "Element Not Found"}

# @router.get("/browser/findByXpath/{xpath}")
# async def FindByXpath(xpath: str):
#     element = driver.find_element_by_xpath(xpath)
#     return {"message": "Element Found"}

# @router.get("/browser/click/{xpath}")
# async def ClickElement(xpath: str):
#     element = driver.find_element_by_xpath(xpath)
#     element.click()
#     return {"message": "Element Clicked"}

# @router.get("/browser/{website}")
# async def OpenWebsite(website: str):
#     if not website.startswith("http"):
#         driver.get("https://"+website)
#     else:
#         driver.get(website)
        
#     return {"message": website+" Opened"}

