from apscheduler.schedulers.asyncio import AsyncIOScheduler
from prisma import Prisma
from scheduler.test import schedule_subflows 
import asyncio

def start_scheduler(scheduler: AsyncIOScheduler, prisma: Prisma):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(prisma.connect())
    scheduler.start()
    loop.run_until_complete(schedule_subflows(scheduler, prisma))
    loop.run_forever()


def check_scheduler(scheduler: AsyncIOScheduler):
    print(scheduler.get_jobs())
    return scheduler.get_jobs()