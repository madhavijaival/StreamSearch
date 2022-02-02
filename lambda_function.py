import json
import requests
import asyncio


def getImdbIdList(dataList, key):
    resultList = []
    for result in dataList:
        resultList.append(result[key])
    return resultList


def getSATitleFromImdbId(imdbId):
    url = "https://streaming-availability.p.rapidapi.com/get/ultra"
    querystring = {"imdb_id": imdbId}
    headers = {
        'x-rapidapi-host': "streaming-availability.p.rapidapi.com",
        'x-rapidapi-key': "a412f8ce24msh8a549cea097c93ap1609c6jsn64d13db83b0d"
    }
    response = requests.request("GET", url, headers=headers, params=querystring)

    if response.text == "no records are found for the given id\n":
        return
    else:
        return response.text


async def getSASearchTitleData(params):
    url = "https://imdb-api.com/en/API/SearchTitle/k_7q1n2xyl/" + params["q"]
    response = requests.request("GET", url)
    imdbIdList = getImdbIdList(json.loads(response.text)["results"], "id")
    return await asyncio.gather(*[asyncio.to_thread(getSATitleFromImdbId, imdbId) for imdbId in imdbIdList])


def getRatingsData(imdbId):
    url = "https://imdb-api.com/en/API/Ratings/k_7q1n2xyl/" + imdbId
    response = requests.request("GET", url)
    return json.loads(response.text)


async def getSASearchCriteriaData(params):
    url = "https://streaming-availability.p.rapidapi.com/search/ultra"
    headers = {
        'x-rapidapi-host': "streaming-availability.p.rapidapi.com",
        'x-rapidapi-key': "a412f8ce24msh8a549cea097c93ap1609c6jsn64d13db83b0d"
    }

    request = json.loads(requests.request("GET", url, headers=headers, params=params).text)

    if "min_rt_rating" in params or "min_mc_rating" in params:
        imdbIdList = getImdbIdList(request["results"], "imdbID")
        ratingsList = await asyncio.gather(*[asyncio.to_thread(getRatingsData, imdbId) for imdbId in imdbIdList])
        request["results"] = combineListOfObjects(request["results"], ratingsList)
        request = filterResultsByRating(params, request)

    return request


def filterResultsByRating(params, request):
    ret = {"results": [],
           "total_pages": request["total_pages"]}

    for i in range(len(request["results"])):
        if "min_rt_rating" in params and "min_mc_rating" in params:
            if request["results"][i]["rottenTomatoes"] == "" or request["results"][i]["rottenTomatoes"] is None:
                if request["results"][i]["metacritic"] == "" or request["results"][i]["metacritic"] is None:
                    ret["results"].append(request["results"][i])
                elif params["min_mc_rating"] <= request["results"][i]["metacritic"] <= params["max_mc_rating"]:
                    ret["results"].append(request["results"][i])
            elif params["min_rt_rating"] <= request["results"][i]["rottenTomatoes"] <= params["max_rt_rating"]:
                if request["results"][i]["metacritic"] == "":
                    ret["results"].append(request["results"][i])
                elif params["min_mc_rating"] <= request["results"][i]["metacritic"] <= params["max_mc_rating"]:
                    ret["results"].append(request["results"][i])

        elif "min_mc_rating" in params:
            if request["results"][i]["metacritic"] == "" or request["results"][i]["metacritic"] is None:
                ret["results"].append(request["results"][i])
            elif params["min_mc_rating"] <= request["results"][i]["metacritic"] <= params["max_mc_rating"]:
                ret["results"].append(request["results"][i])

        elif "min_rt_rating" in params:
            if request["results"][i]["rottenTomatoes"] == "" or request["results"][i]["rottenTomatoes"] is None:
                ret["results"].append(request["results"][i])
            elif params["min_rt_rating"] <= request["results"][i]["rottenTomatoes"] <= params["max_rt_rating"]:
                ret["results"].append(request["results"][i])

    return ret


def combineListOfObjects(list1, list2):
    for i in range(len(list1)):
        for key in list2[i].keys():
            list1[i][key] = list2[i][key]
    return list1


def removeNoneItemsFromList(theList):
    for i in range(theList.count(None)):
        theList.remove(None)
    return theList


def lambda_handler(event, context):
    if event['queryStringParameters']['search_type'] == "title":
        response = asyncio.run(getSASearchTitleData(event['queryStringParameters']))
        response = removeNoneItemsFromList(response)
    else:
        response = asyncio.run(getSASearchCriteriaData(event['queryStringParameters']))

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps(response)
    }


pams = {
  "queryStringParameters": {
    "search_type": "criteria",
    "country": "us",
    "services": "netflix,hulu,disney,hbo",
    "type": "movie",
    "order_by": "imdb_rating",
    "year_min": "2002",
    "year_max": "2021",
    "page": "1",
    "desc": "true",
    "language": "en",
    "min_imdb_rating": "58",
    "max_imdb_rating": "86",
    "output_language": "en",
    "min_mc_rating": "54",
    "max_mc_rating": "100",
    "min_rt_rating": "56",
    "max_rt_rating": "100"
  }
}

res = lambda_handler(pams, "")

