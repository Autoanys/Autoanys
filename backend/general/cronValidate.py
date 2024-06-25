from cron_validator import CronValidator
from croniter import croniter


async def validate_cron(cronString):
    try:
        if croniter.is_valid(cronString):
            return True
        else:
            return False

    except Exception as e:
        print(e)
        return False
