from fastapi import APIRouter, HTTPException
from PIL import Image
#from Screenshot import Screenshot_clipping
from pathlib import Path
import smtplib, ssl
from prisma import Prisma


router = APIRouter()


@router.post("/mail/send")
async def send_mail(profile_json: dict):
    prisma = Prisma()
    await prisma.connect()
    email_profile = await prisma.emailprofile.find_unique(where = {"id": "clwyr82yu0000sthnn0wpe9s1"})

    port = email_profile.port
    smtp_server = email_profile.smtp
    login = email_profile.email
    password = email_profile.password

    try:
        email_message = profile_json['email_message']
        email_subject = profile_json['email_subject']
        # context = ssl.create_default_context()
        with smtplib.SMTP(smtp_server, port) as server:
            server.ehlo()  # Can be omitted
            # server.starttls(context=context)
            server.ehlo()  # Can be omitted
            server.login(login, password)
            server.sendmail(login, "developer.charles@gmail.com", email_message)
            return {"message": "done"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

