from fastapi import APIRouter, HTTPException
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
from routers.db.logs import write_logging
import socket
from routers.chrome.browser import OpenBrowser, OpenWebsite, GetScreenshot, CloseBrowser
from routers.utility.general import sleep_wait


hostname = socket.getfqdn()
ip = socket.gethostbyname_ex(hostname)[2][1]

router = APIRouter()

def sda(json_data):
    return

def checkStartToEnd(json_data: dict):
    edges = json_data.get("edges", [])
    start_node_connected = False

    # Check if there is an edge from start-node to any other node
    for edge in edges:
        if edge["source"] == "start-node":
            start_node_connected = True
            break

    if not start_node_connected:
        return False

    # Check if there is an edge from the last node to end-node
    for edge in edges:
        if edge["target"] == "end-node":
            return True

    return False



@router.post("/flow/")
async def analyze_json(json_datas: dict):
    print(json_datas)
    try:
        startToEnd = checkStartToEnd(json_datas)
        if(startToEnd):
            steps = []
            for step in json_datas["edges"]:
                
                if step["source"] != "start-node" and step["source"] != "end-node":
                    # get node details from edges and nodes
                    source = step["source"]
                    source_node = next((node for node in json_datas["nodes"] if node["id"] == source), None)
                    if source_node['type'] == "openBrowserLink":
                        steps.append(f"http://{ip}:8000" + source_node['data']['api'] +  source_node['data']['value'])
                    if source_node['type'] == "waitSecond":
                        steps.append(f"http://{ip}:8000" + source_node['data']['api'] +  source_node['data']['value'])
                    else:
                        steps.append(f"http://{ip}:8000" + source_node['data']['api'])
                if step["source"] == "end-node":
                    print(step)
            print(steps)
            return {"message":"Start to end valid", "steps":steps}
        else:
            raise HTTPException(status_code=451, detail="Error in analyzing flow")
    except Exception as e:
        print(e)
        # raise HTTPException(status_code=404, detail="Error in analyzing flow")
        raise HTTPException(status_code=450,  detail="Error in analyzing flow")

Correspondence_function_list = {
    "openBrowser" : "OpenBrowser",
    "openBrowserLink" : "OpenWebsite",
    "waitSecond" : "sleep_wait",
    "closeBrowser" : "CloseBrowser",
    "getScreenshot" : "GetScreenshot"
}

@router.post("/flow/v2/")
async def analyze_json(json_datas: dict):
    print(json_datas)
    try:
        startToEnd = checkStartToEnd(json_datas)
        if(startToEnd):
            temp = {}
            post_data = {}
            steps = []
            for step in json_datas["edges"]:
                if step["source"] != "start-node" and step["source"] != "end-node":
                    # get node details from edges and nodes
                    source = step["source"]
                    source_node = next((node for node in json_datas["nodes"] if node["id"] == source), None)
                    print("OK", source_node['data']['inputs'])
                          
                    if len(source_node['data']['inputs']) > 0 and source_node['data']['method'] == "POST":
                        print(source_node['data']['inputs'], "testest")
                        temp["api"] = f"http://{ip}:8000" + source_node['data']['api']
                        temp["method"] = source_node['data']['method']
                        temp["function"] = Correspondence_function_list[source_node['type']]
                        # temp["function"] = Correspondence_function(source_node['type'])
                        
                        for i in source_node['data']['inputs']:
                            print(i, "i", i['id'], i['value'])
                            post_data[i['id']] = i['value']
                            print("this is post_data", post_data)
                            
                        temp["post_data"] = post_data
                        print(temp, "temp")
                        print(post_data, "post_data")
                        post_data = {}
                        steps.append(temp)
                        temp = {}
                    else:
                        temp["api"] = f"http://{ip}:8000" + source_node['data']['api']
                        temp["method"] = source_node['data']['method']
                        temp["function"] = Correspondence_function_list[source_node['type']]

                        steps.append(temp)
                        temp = {}

            for node in json_datas["nodes"]:
                if node["id"] == "end-node" and node["data"]["inputs"][0]["value"]:
                    print("-------------------END-------------------")
                    print(node)

                      
            print("STEP", steps)
            return {"message":"Start to end valid", "steps":steps}
        else:
            raise HTTPException(status_code=451, detail="Error in analyzing flow")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=450,  detail="Errosr in analyzing flow")
