from fastapi import APIRouter, HTTPException
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
import time
import subprocess
import paramiko

router = APIRouter()
client = paramiko.SSHClient()
client.load_system_host_keys()



@router.post("/ssh/open")
async def open_ssh(profile_json: dict[str, str]):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    connect_args = {
        'hostname': profile_json['ip'],
        'username': profile_json['uname'],
    }

    if 'pwd' in profile_json:
        connect_args['password'] = profile_json['pwd']

    if 'keyfile' in profile_json:
        connect_args['key_filename'] = profile_json['keyfile']
    if 'port' in profile_json:
        connect_args['port'] = int(profile_json['port'])

    try:
        client.connect(**connect_args)
        return {"message": "done"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ssh/command/")
async def exe_ssh(json: dict):
    command = json["command"]
    stdin, stdout, stderr = client.exec_command(command)
    out  = stdout.read()
    print(out)
    oututf8 = out.decode('utf-8')
    print(oututf8)
    for line in oututf8.split('\n'): 
        print(line)


    return {"message": f"{oututf8}"}

@router.get("/ssh/close")
async def close_ssh():
    client.close()
    return {"message": f"close"}

