from fastapi import APIRouter, HTTPException
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
from routers.db.logs import write_logging

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
                        steps.append("http://localhost:8000" + source_node['data']['api'] +  source_node['data']['value'])
                    if source_node['type'] == "waitSecond":
                        steps.append("http://localhost:8000" + source_node['data']['api'] +  source_node['data']['value'])
                    else:
                        steps.append("http://localhost:8000" + source_node['data']['api'])
            print(steps)
            return {"message":"Start to end valid", "steps":steps}
        else:
            raise HTTPException(status_code=451, detail="Error in analyzing flow")
    except Exception as e:
        print(e)
        # raise HTTPException(status_code=404, detail="Error in analyzing flow")
        raise HTTPException(status_code=450,  detail="Error in analyzing flow")


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
                        # steps.append("http://localhost:8000" + source_node['data']['api'] +  source_node['data']['value'])
                        print(source_node['data']['inputs'], "testest")
                        temp["api"] = "http://localhost:8000" + source_node['data']['api']
                        temp["method"] = source_node['data']['method']
                        
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
                        temp["api"] = "http://localhost:8000" + source_node['data']['api']
                        temp["method"] = source_node['data']['method']
                        steps.append(temp)
                        temp = {}
                        # temp["mtho"] =
                    # if source_node['type'] == "waitSecond":
                    #     steps.append("http://localhost:8000" + source_node['data']['api'] +  source_node['data']['value'])
                    # else:
                    #     steps.append("http://localhost:8000" + source_node['data']['api'])
            print("STEP", steps)
            return {"message":"Start to end valid", "steps":steps}
        else:
            raise HTTPException(status_code=451, detail="Error in analyzing flow")
    except Exception as e:
        print(e)
        # raise HTTPException(status_code=404, detail="Error in analyzing flow")
        print(e)
        raise HTTPException(status_code=450,  detail="Errosr in analyzing flow")
