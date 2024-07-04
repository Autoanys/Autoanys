from fastapi import APIRouter, HTTPException
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
import time
import asyncio
from prisma import Prisma
import ast
import subprocess
import tempfile
from fastapi import FastAPI
from pydantic import BaseModel
import datetime

router = APIRouter()

class CodePayload(BaseModel):
    component_coding: str
    
def validate_code(code):
    try:
        # Check for presence of function definition
        if 'def ' not in code and 'async def ' not in code:
            return False, "Code must contain a function definition."

        # Parse the code to check for return statement and specific return format
        tree = ast.parse(code)
        contains_return = False
        contains_message_return = False

        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                print(f"Function found: {node.name}")
                for n in ast.walk(node):
                    if isinstance(n, ast.Return):
                        contains_return = True
                        if isinstance(n.value, ast.Dict):
                            for key in n.value.keys:
                                if isinstance(key, ast.Str) and key.s == "message":
                                    contains_message_return = True
                                    print(f"Return with message found in function: {node.name}")

        if not contains_return:
            return False, "Function must contain a return statement."
        if not contains_message_return:
            return False, 'Return statement must include a dictionary with a "message" key.'

        # Write code to a temporary file and execute it
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.py', delete=False) as temp_file:
            temp_file.write(code)
            temp_file.flush()
            process = subprocess.run(
                ['python', temp_file.name],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            if process.returncode != 0:
                return False, process.stderr
            return True, process.stdout
    except Exception as e:
        return False, str(e)
    

@router.get("/components/active/{comp_id}")
async def activate_component(comp_id : str):
    prisma = Prisma()
    await prisma.connect()
    orginal_comp = await prisma.component.find_unique(where={
        "id": comp_id
    })

    switch = False if orginal_comp.active else True
    activation = "activated" if switch else "deactivated"
    comp_data = await prisma.component.update(
        where={
            "id": comp_id
        },
        data={
            "active": switch
        }
    )
    
    await prisma.disconnect()
    return {"message": f"Component {orginal_comp.name}, {comp_id} {activation} successfully"}



@router.post("/components/create")
async def save_component(json_data: dict):
    try:
        prisma = Prisma()
        await prisma.connect()
        print("json_data", json_data)
        component_name = json_data["component_name"]
        component_category = json_data["component_category"]
        component_description = json_data["component_description"]
        component_coding = json_data["component_coding"]
        payload = CodePayload(component_coding=component_coding)
        code = payload.component_coding
        is_valid, message = validate_code(code)

        print("is valid and message", is_valid, message)
        if is_valid:
            component = await prisma.component.create(
                data={
                    "name": component_name,
                    "category": component_category,
                    "description": component_description,
                    "coding": component_coding
                }
            )
            print(json_data)
            await prisma.disconnect()
            return {"message": f"{component} saved successfully"}
        else:
            print("Error: ", message)
            raise HTTPException(status_code=450, detail="Cannot Create")

    except Exception as e:
        raise HTTPException(status_code=450, detail="Cannot Create")



@router.post("/components/edit/{comp_id}")
async def edit_component(json_data: dict, comp_id: str):
    try:
        prisma = Prisma()
        await prisma.connect()
        component_name = json_data["component_name"]
        component_category = json_data["component_category"]
        component_description = json_data["component_description"]
        component_coding = json_data["component_coding"]
        payload = CodePayload(component_coding=component_coding)
        code = payload.component_coding
        is_valid, message = validate_code(code)

        print("is valid and message", is_valid, message)
        if is_valid:
            component = await prisma.component.update(
                where={
                    "id": comp_id
                },
                data={
                    "name": component_name,
                    "category": component_category,
                    "description": component_description,
                    "coding": component_coding,
                    "updated_at": datetime.datetime.now()
                }
            ),
            await prisma.disconnect()
            return {"message": f"{component} updated successfully"}
        else:
            raise HTTPException(status_code=450, detail=f"Error: {message}")

    except Exception as e:
        return {"message": f"Error: {e}"}



@router.get("/components/delete/{comp_id}")
async def delete_component(comp_id : str):
    prisma = Prisma()
    await prisma.connect()


    comp_data = await prisma.component.delete(
        where={
            "id": comp_id
        }
    ),
    await prisma.disconnect()
    return {"message": f"Component {comp_id} deleted successfully"}


@router.get("/components/componentID/{component_id}")
async def get_component(component_id: str):
    try:
        prisma = Prisma()
        await prisma.connect()
        component = await prisma.component.find_unique(where={"id": component_id})
        await prisma.disconnect()
    
        return component
    except Exception as e:
        return {"message": f"Error: {e}"}
    
@router.get("/components/all/")
async def get_all_components():
    try:
        prisma = Prisma()
        await prisma.connect()
        components = await prisma.component.find_many()
        await prisma.disconnect()
    
        return {"message": "Sucessfully", "data": components}
    except Exception as e:
        return {"message": f"Error: {e}"}
    
@router.post("/components/validate")
async def validate_component(payload: CodePayload):
    code = payload.component_coding
    is_valid, message = validate_code(code)
    if is_valid:
        print("Valid")
        return {"message": "Code is valid", "output": message}
    else:
        print("NOT Valid")
        return {"message": "Code is invalid", "error": message}