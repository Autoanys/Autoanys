from fastapi import APIRouter

import datetime
import mysql.connector


router = APIRouter()

@router.post("/mysql/query/")
async def mySQLQuery(json_data: dict):
    query = json_data.get("query")
    user = json_data.get("user")
    database = json_data.get("database")
    if query and user and database:
        cnx = mysql.connector.connect(user=user, database=database)
        cursor = cnx.cursor()
        cursor.execute(query)
        result = cursor.fetchall()
        print(result)
        # for (first_name, last_name, hire_date) in cursor:
        #     print("{}, {} was hired on {:%d %b %Y}".format(
        #         last_name, first_name, hire_date))
        cursor.close()
        cnx.close()
        return {"message": "Query Executed", "result": result}
    else:
        return {"message": "Query Not Executed"}

    # cnx = mysql.connector.connect(user='scott', database='employees')
    # cursor = cnx.cursor()

    # query = ("SELECT first_name, last_name, hire_date FROM employees "
    #         "WHERE hire_date BETWEEN %s AND %s")

    # hire_start = datetime.date(1999, 1, 1)
    # hire_end = datetime.date(1999, 12, 31)

    # cursor.execute(query, (hire_start, hire_end))

    # for (first_name, last_name, hire_date) in cursor:
    #     print("{}, {} was hired on {:%d %b %Y}".format(
    #         last_name, first_name, hire_date))

    # cursor.close()
    # cnx.close()