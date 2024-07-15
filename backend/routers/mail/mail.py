import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, HTTPException
from prisma import Prisma
import ssl


router = APIRouter()

@router.post("/mail/send")
async def send_mail(profile_json: dict):
    prisma = Prisma()
    await prisma.connect()
    try:
        email_profile = await prisma.emailprofile.find_unique(where={"id": "clwyr82yu0000sthnn0wpe9s1"})
        if not email_profile:
            return {"error": "Email profile not found"}
        
        port = email_profile.port
        smtp_server = email_profile.smtp
        login = email_profile.email
        password = email_profile.password

        email_message = profile_json['email_message']
        email_subject = profile_json['email_subject']
        recipient_email = profile_json['recipient_email']
        
        message = MIMEMultipart()
        message['From'] = login
        message['To'] = recipient_email
        message['Subject'] = email_subject
        
        message.attach(MIMEText(email_message, "plain"))
        
        try:
            context = ssl.create_default_context()
            with smtplib.SMTP(smtp_server, port) as server:
                server.ehlo()  # Can be omitted
                server.starttls(context=context)
                server.ehlo()  # Can be omitted
                server.login(login, password)
                server.sendmail(login, recipient_email, message.as_string())
            return {"success": "Email sent successfully"}
        except smtplib.SMTPAuthenticationError:
            return {"error": "Authentication failed. Please check your email credentials."}
        except smtplib.SMTPConnectError:
            return {"error": "Failed to connect to the SMTP server. Please check the server address and port."}
        except smtplib.SMTPRecipientsRefused:
            return {"error": "The recipient's email address was refused."}
        except smtplib.SMTPSenderRefused:
            return {"error": "The sender's email address was refused."}
        except smtplib.SMTPDataError:
            return {"error": "The SMTP server refused to accept the message data."}
        except Exception as e:
            return {"error": f"An unexpected error occurred: {str(e)}"}
        finally:
            await prisma.disconnect()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mail/testProfile")
async def test_profile():
    prisma = Prisma()
    await prisma.connect()
    email_profile = await prisma.emailprofile.find_unique(where = {"id": "clwyr82yu0000sthnn0wpe9s1"})
    print(email_profile)
    return email_profile
