from fastapi import APIRouter, HTTPException
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
from routers.db.logs import write_logging
import socket
from routers.chrome.browser import OpenBrowser, OpenWebsite, GetScreenshot, CloseBrowser, FindByXpathType, FindByXpathClick, FindBy
from routers.utility.general import sleep_wait, upload
import json


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
        raise HTTPException(status_code=452,  detail="Error in analyzing flow")

Correspondence_function_list = {
    "openBrowser" : "OpenBrowser",
    "openBrowserLink" : "OpenWebsite",
    "waitSecond" : "sleep_wait",
    "closeBrowser" : "CloseBrowser",
    "getScreenshot" : "GetScreenshot",
    "findElementClick" : "FindByXpathClick",
    "findElementType" : "FindByXpathType",
    "findElement" : "FindBy",
    "uploadFile" : "upload"
}

@router.post("/flow/v2/")
async def analyze_json(json_datas: dict):
    print(json_datas)
    try:
        startToEnd = checkStartToEnd(json_datas)
        if startToEnd:
            temp = {}
            post_data = {}
            steps = []
            print("Step 1")
            # Helper function to find the source node details
            def get_node_details(node_id):
                return next((node for node in json_datas["nodes"] if node["id"] == node_id), None)

            # Initialize the start node
            current_node_id = "start-node"
            visited_nodes = set()
            print("Step 2")
            while current_node_id and current_node_id != "end-node":
                if current_node_id in visited_nodes:
                    break
                visited_nodes.add(current_node_id)
                
                # Get the current node details
                current_node = get_node_details(current_node_id)
                print("Step 3")
                # Process the current node if it is not the start or end node
                if current_node and current_node_id != "start-node":
                    if len(current_node['data']['inputs']) > 0 and current_node['data']['method'] == "POST":
                        temp["api"] = f"http://{ip}:8000" + current_node['data']['api']
                        temp["method"] = current_node['data']['method']
                        temp["function"] = Correspondence_function_list[current_node['type']]
                        print("Step 4")
                        for i in current_node['data']['inputs']:
                            if (i['variable'] and i['value'].startswith("CAAS$")) or (i['variable'] and i['value'].startswith("AAS$")):
                                try:
                                    print("Step 5")
                                    for var in json_datas["variables"]:
                                        if var['key'] == i['value'] and var['value']:
                                            post_data[i['id']] = var['value']
                                        else:
                                            post_data[i['id']] = i['value']
                                except Exception as e:
                                    try:
                                        for var in json.loads(json_datas["variables"]):
                                            if var['key'] == i['value'] and var['value']:
                                                post_data[i['id']] = var['value']
                                            else:
                                                post_data[i['id']] = i['value']
                                    except Exception as e:
                                        print(e)
                                        raise HTTPException(status_code=451, detail="Error in analyzing flow")
                            else:
                                post_data[i['id']] = i['value']
                        temp["post_data"] = post_data
                        post_data = {}
                        steps.append(temp)
                        temp = {}
                    else:
                        temp["api"] = f"http://{ip}:8000" + current_node['data']['api']
                        temp["method"] = current_node['data']['method']
                        temp["function"] = Correspondence_function_list[current_node['type']]
                        steps.append(temp)
                        temp = {}

                # Find the next node from the edges
                next_edge = next((edge for edge in json_datas["edges"] if edge["source"] == current_node_id), None)
                current_node_id = next_edge["target"] if next_edge else None

            for node in json_datas["nodes"]:
                if node["id"] == "end-node" and node["data"]["inputs"][0]["value"]:
                    print("-------------------END-------------------")
                    print(node)

            print("STEP", steps)
            return {"message": "Start to end valid", "steps": steps}
        else:
            raise HTTPException(status_code=452, detail="Error in analyzing flow")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=453, detail="Error in analyzing flow")
