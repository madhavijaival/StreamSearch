let allServiceList;
let globalSelectedServiceList;
let globalCountry;
let globalQueryString;
let globalCurrentPageNum;
let globalTotalPages;
let globalGenreObject;
let globalCountryObject;
let globalRTChecked;
let globalMCChecked;

function onLoad() {
    initializeGlobals();
    populateYearLists();
    fetchCountryGenreAudio();

    let form = document.getElementById("submitSearchForm");
    function handleForm(event) { event.preventDefault(); }
    form.addEventListener('submit', handleForm);

    addEnterButtonEventForTextInput("searchTextbox", "searchButton");
}

function initializeGlobals() {
    allServiceList = [];
    globalSelectedServiceList = [];
    globalGenreObject = {};
    globalCountry = "";
    globalQueryString = "";
    globalCurrentPageNum = 1;
    globalTotalPages = 0;
    globalCountryObject = {};
    globalRTChecked = false;
    globalMCChecked = false;
}

function addEnterButtonEventForTextInput(inputID, buttonID) {
    // Get the input field
    let input = document.getElementById(inputID);

// Execute a function when the user releases a key on the keyboard
    input.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById(buttonID).click();
        }
    });
}

function populateYearLists() {
    populateYearSelect("startYearSelect");
    populateYearSelect("endYearSelect");
}

//TODO: Remove this function and replace usage with populateSelectList
function populateYearSelect(selectTag) {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i > 1940; i--) {
        let option = document.createElement("option");
        option.setAttribute("value", String(i));
        option.innerHTML = String(i);
        document.getElementById(selectTag).appendChild(option);
    }
}

function populateCountrySelect(countryObject) {
    globalCountryObject = countryObject;
    for (let key in countryObject) {
        let option = document.createElement("option");
        option.setAttribute("value", JSON.stringify(countryObject[key]));
        option.innerHTML = key;
        if (key === "United States of America") {
            option.selected = true;
            changeServices(countryObject["United States of America"][1]);
        }
        document.getElementById("countrySelect").appendChild(option);
    }
}

//Utility
function capitalizeFirstLetter(input) {
    return input[0].toUpperCase() + input.slice(1);
}

function populateServiceList(serviceList) {
    allServiceList = serviceList;
    for (let i in serviceList) {
        let listItem = document.createElement("li");
        let checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("id", serviceList[i] + "Checkbox");
        checkbox.setAttribute("value", serviceList[i]);
        let label = document.createElement("label");
        label.setAttribute("id", serviceList[i] + "Label");
        label.setAttribute("for", serviceList[i] + "Checkbox");
        label.innerHTML = capitalizeFirstLetter(serviceList[i]);
        listItem.appendChild(checkbox);
        listItem.appendChild(label);
        document.getElementById("streamingCheckboxList").appendChild(listItem);
    }
}

function populateGenreSelect(genreObject) {
    globalGenreObject = genreObject;
    genreObject = swapJsonKeysAndValues(genreObject);
    genreObject = alphaSortJson(genreObject);
    let option = document.createElement("option");
    option.setAttribute("value", "");
    option.innerHTML = "All";
    option.selected = true;
    document.getElementById("genreSelect").appendChild(option);
    for (let key in genreObject) {
        option = document.createElement("option");
        option.setAttribute("value", genreObject[key]);
        option.innerHTML = key;
        document.getElementById("genreSelect").appendChild(option);
    }
}

function populateAudioSelect(audioObject) {
    for (let key in audioObject) {
        let option = document.createElement("option");
        option.setAttribute("value", audioObject[key]);
        option.innerHTML = key;
        if (key === "English") {
            option.selected = true;
        }
        document.getElementById("audioSelect").appendChild(option);
    }
}

function changeServices(serviceList) {
    //Hide services
    for (let i in allServiceList) {
        if (serviceList.indexOf(allServiceList[i]) === -1) {
            let checkbox = document.getElementById(allServiceList[i] + "Checkbox");
            checkbox.hidden = true;
            checkbox.checked = false;
            document.getElementById(allServiceList[i] + "Label").hidden = true;
        }
    }
    //Un-hide services
    for (let i in serviceList) {
        document.getElementById(serviceList[i] + "Checkbox").hidden = false;
        document.getElementById(serviceList[i] + "Label").hidden = false;
    }
}

function selectOrDeselectAllServices() {
    let countryServicesList = JSON.parse(document.submitSearchForm.countrySelect.value)[1];
    for (let i in countryServicesList) {
        document.getElementById(countryServicesList[i] + "Checkbox").checked = document.getElementById("allServicesCheckbox").checked === true;
    }
}

function getRequestOptions(method) {
    // instantiate a headers object
    let myHeaders = new Headers();
    // add content type header to object
    myHeaders.append("Content-Type", "application/json");
    // create a JSON object with parameters for API call and store in a variable
    return {
        method: method,
        headers: myHeaders,
        redirect: 'follow',
        mode: 'cors',
    }
}

function fetchCountryGenreAudio() {
    let url = 'https://vktamcl8yk.execute-api.us-west-1.amazonaws.com/test/load';
    let requestOptions = getRequestOptions('GET');

    fetch(url, requestOptions)
        .then(response => response.json())
        .then(function(data) {
            let body = data["body"];
            let audioObject = body["AudioObject"];
            let countryObject = body["CountryObject"];
            let genreObject = body["GenreObject"];
            let serviceList = body["ServiceList"];
            populateServiceList(serviceList);
            populateCountrySelect(countryObject);
            populateGenreSelect(genreObject);
            populateAudioSelect(audioObject);
        })
        .catch(error => console.log("error", error));
}

function getSelectedServicesString() {
    let chosenServicesList = [];
    let returnString = "";

    for (let i = 0; i < allServiceList.length; i++) {
        if (document.getElementById(allServiceList[i] + "Checkbox").checked === true) {
            chosenServicesList.push(allServiceList[i]);
        }
    }
    globalSelectedServiceList = chosenServicesList;
    for (let i = 0; i < chosenServicesList.length; i++) {
        if (i === 0) {
            returnString += chosenServicesList[i];
        }
        else {
            returnString += "," + chosenServicesList[i];
        }
    }
    return returnString;
}

function ratingWebsiteChecked(ratingWebsite) {
    let visibility;
    if (document.getElementById(ratingWebsite + "Checkbox").checked === true) {
        visibility = "visible";
    }
    else {
        visibility = "hidden"
    }
    //document.getElementById(ratingWebsite + "Range").style.visibility = visibility;
    //document.getElementById(ratingWebsite + "RangeLabel").style.visibility = visibility;
    document.getElementById(ratingWebsite + "MinRange").style.visibility = visibility;
    document.getElementById(ratingWebsite + "MinRangeLabel").style.visibility = visibility;
    document.getElementById(ratingWebsite + "MaxRange").style.visibility = visibility;
    document.getElementById(ratingWebsite + "MaxRangeLabel").style.visibility = visibility;
}

//Gets the list of selected countries from the countrySelect and converts it to a string with ',' delimiter
function getGenreString() {
    let genreSelect = document.submitSearchForm.genreSelect;
    let options = genreSelect.options;
    let optionList = [];
    let count = 0;
    for (let i = 0; i < options.length; i++) {
        if (options[i].selected === true) {
            optionList[count++] = options[i].value;
        }
    }
    let genreString = "";
    for (let i = 0; i < optionList.length; i++) {
        if (optionList[i] === "") {
            genreString = "";
        }
        else {
            //Check for the last list element (will break if there is a comma at the end of the string)
            if (i === optionList.length - 1) {
                genreString += optionList[i];
            }
            else {
                genreString += optionList[i] + ",";
            }
        }
    }
    return genreString;
}


function getSearchCriteriaParams() {
    let ssf = document.submitSearchForm;
    let servicesString = getSelectedServicesString();
    if (servicesString === "") {
        return "";
    }
    let typeString = ssf.typeSelect.value;
    let startYearString = ssf.startYearSelect.value;
    let orderByString = ssf.orderBySelect.value;
    let genreAndOrString = ssf.genreAndOrRadio.value;
    let endYearString = ssf.endYearSelect.value;
    let languageString = ssf.audioSelect.value;
    let countryString = JSON.parse(ssf.countrySelect.value)[0];
    let genreString = getGenreString();
    globalCountry = countryString;

    let returnString = '?search_type=criteria&services='+servicesString+'&type='+typeString+
        '&year_min='+startYearString+'&order_by='+orderByString+'&year_max='+endYearString+'&language='+languageString+
        '&country='+countryString+'&desc=true';

    if (genreAndOrString !== "") {
        returnString += '&genres_relation='+genreAndOrString;
    }
    if (genreString !== "") {
        returnString += '&genres='+genreString;
    }
    if (ssf.imdbCheckbox.checked === true) {
        returnString += '&min_imdb_rating='+ssf.imdbMinRange.value*10+'&max_imdb_rating='+
            ssf.imdbMaxRange.value*10;
    }
    if (ssf.rtCheckbox.checked === true) {
        returnString += '&min_rt_rating='+ssf.rtMinRange.value+'&max_rt_rating='+ssf.rtMaxRange.value;
        globalRTChecked = true;
    }
    if (ssf.mcCheckbox.checked === true) {
        returnString += '&min_mc_rating='+ssf.mcMinRange.value+'&max_mc_rating='+ssf.mcMaxRange.value;
        globalMCChecked = true;
    }
    globalQueryString = returnString;
    //console.log(returnString);
    return returnString;
}

function searchUsingCriteria(pageNum = 0) {
    let url = 'https://vktamcl8yk.execute-api.us-west-1.amazonaws.com/dev/sa';
    let requestOptions = getRequestOptions('GET');

    if (pageNum === 0) {
        let requestParams = getSearchCriteriaParams();
        if (requestParams === "") {
            alert("Must Select a Streaming Service");
            return;
        }
        url += requestParams;
    }
    else {
        url += globalQueryString + "&page=" + pageNum.toString();
    }

    fetch(url, requestOptions)
        .then(response => response.json())
        .then(function(data) {
            createSearchCriteriaResultsWindow(data);
        })
        .catch(error => console.log("error", error));
}

function convertObjectToString(jsonObject) {
    let returnString = "";
    let entryList = Object.entries(jsonObject);
    for (let i = 0; i < entryList.length; i++) {
        if (i === entryList.length - 1) {
            returnString += entryList[i][0] + ": " + entryList[i][1];
        }
        else {
            returnString += entryList[i][0] + ": " + entryList[i][1] + ",  ";
        }
    }
    return returnString;
}

function createSearchCriteriaResultsWindow(data) {
    let body = createResultsWindow();

    if (data.results.length === 0) {
        let p = document.createElement("p");
        let label = document.createElement("label");
        label.innerHTML = "No Results";
        p.appendChild(label);
        body.appendChild(p);
        return;
    }

    if (globalCurrentPageNum === 1) {
        let queryHeading = document.createElement("h6");
        queryHeading.innerHTML = globalQueryString;
        body.appendChild(queryHeading);
    }

    let table = createResultsTable(data.results, data.results.length);
    body.appendChild(table);

    //Check if there are any additional pages & add a next page button if there are
    if (globalCurrentPageNum < data.total_pages) {
        //Next page button
        let p = document.createElement("p");
        let button = document.createElement("button");
        button.setAttribute("type", "button");
        p.setAttribute("align", "right");
        button.innerHTML = "Next Page";
        let pageNum = ++globalCurrentPageNum;
        let searchString = "searchUsingCriteria(" + pageNum.toString() + ")";
        button.setAttribute("onclick", searchString);
        p.appendChild(button);
        body.appendChild(p);
    }
}

//Utility
function removeTrailingStringAfterChar(inputString, char) {
    if (inputString.indexOf(char) === -1) {
        return inputString;
    }
    else {
        return inputString.substring(0, inputString.indexOf(char));
    }
}

function appendCellToRow(row, data, tag) {
    let cell = document.createElement(tag);
    cell.innerHTML = data;
    row.appendChild(cell);
}

//Utility
function isArrayEmpty(theArray) {
    return theArray.length === 0;
}

function bigImg(x) {
    x.style.width = "148px";
    x.style.height = "auto";
}

function normalImg(x) {
    x.style.width = "56px";
    x.style.height = "auto";
}

function createLinkString(href, text) {
    let a = document.createElement("a");
    a.setAttribute("href", href);
    a.innerHTML = capitalizeFirstLetter(text);
    return a.outerHTML;
}

function createResultsTable(data, numRows) {
    let table = document.createElement("table");
    table.setAttribute("class", "resultsTable");
    let row, runtime, imageString, runtimeInt, servicesString, count;

    row = document.createElement("tr");
    appendCellToRow(row, "Image", "th");
    appendCellToRow(row, "Title", "th");
    appendCellToRow(row, "IMDb Rating", "th");
    appendCellToRow(row, "Release Year", "th");
    appendCellToRow(row, "Runtime", "th");
    appendCellToRow(row, "Services", "th");
    appendCellToRow(row, "Genres", "th");
    appendCellToRow(row, "Synopsis", "th");
    table.appendChild(row);

    for (let i = 0; i < numRows; i++) {
        row = document.createElement("tr");
        imageString = "<image onmouseover='bigImg(this)' onmouseout='normalImg(this)' src=" + data[i].posterURLs.original + " alt='' style='width: 56px; height: auto'>";
        appendCellToRow(row, imageString, "td");
        appendCellToRow(row, data[i].originalTitle, "td");
        appendCellToRow(row, ((data[i].imdbRating)/10).toFixed(1), "td");
        appendCellToRow(row, data[i].year, "td");

        //Get runtime value in hh:mm:ss format
        runtimeInt = data[i].runtime * 60;
        if (runtimeInt < 3600) {
            runtime = new Date(runtimeInt * 1000).toISOString().substr(14, 5);
        } else if (runtimeInt > 3600) {
            runtime =  new Date(runtimeInt * 1000).toISOString().substr(11, 8);
        }

        //GetStreaming Services string
        servicesString = "";
        count = 0;
        for (let key in data[i]["streamingInfo"]) {
            //If statement is necessary because api provides streaming services that were not selected
            if (globalSelectedServiceList.indexOf(key) >= 0) {
                if (count === 0) {
                    if (data[i]["streamingInfo"][key].hasOwnProperty(globalCountry)) {
                        servicesString += createLinkString(data[i]["streamingInfo"][key][globalCountry]["link"], key);
                    }
                } else {
                    if (data[i]["streamingInfo"][key].hasOwnProperty(globalCountry)) {
                        servicesString += ", " + createLinkString(data[i]["streamingInfo"][key][globalCountry]["link"], key);
                    }
                }
                count +=1;
            }
        }

        //Get Genres String
        let genreString = "";
        for (let j = 0; j < data[i]["genres"].length; j++) {
            //console.log(data[i]["genres"][j]);
            if (j === 0) {
                genreString += globalGenreObject[data[i]["genres"][j]];
            } else {
                genreString += ", " + globalGenreObject[data[i]["genres"][j]];
            }
        }

        appendCellToRow(row, runtime, "td");
        appendCellToRow(row, servicesString, "td");
        appendCellToRow(row, genreString, "td");
        appendCellToRow(row, data[i].overview, "td");
        table.appendChild(row);
    }
    return table;
}

function searchUsingTitle() {
    if (getSelectedServicesString() === "") {
        alert("Must Select a Streaming Service");
        return;
    }

    let url = 'https://vktamcl8yk.execute-api.us-west-1.amazonaws.com/dev/sa';
    let requestOptions = getRequestOptions('GET');
    let params = "?search_type=title&q=" + document.getElementById("searchTextbox").value;
    url += params;

    globalCountry = JSON.parse(document.submitSearchForm.countrySelect.value)[0];

    fetch(url, requestOptions)
        .then(response => response.json())
        .then(function(data) {
            createSearchTitleResultsWindow(data);
        })
        .catch(error => console.log("error", error));
}

//TODO: Replace usages
function createResultsWindow() {
    let newWindow = window.open("", "_self");
    newWindow.document.write("<!DOCTYPE html>\n" + "<html lang=\"en\">");
    newWindow.document.write("<head id='head'><title>Results</title><link rel='stylesheet' href='styleSheet.css'></head>");
    newWindow.document.write("<body id='body' class='bg'></body>");
    //Add Home Button
    let body = newWindow.document.getElementById("body");
    let p = document.createElement("p");
    let button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("onclick", "window.open('index.html', '_self')");
    button.innerHTML = "Home";
    p.appendChild(button);
    body.appendChild(p);
    return body;
}

function createSearchTitleResultsWindow(data) {
    let body = createResultsWindow();

    //Convert each list item to JSON object
    for (let i = 0; i < data.length; i++) {
        data[i] = JSON.parse(data[i]);
    }

    let table = createResultsTable(data, data.length);
    body.appendChild(table);
}

function checkAccessKey(searchType) {
    let url = 'https://vktamcl8yk.execute-api.us-west-1.amazonaws.com/dev/key';
    let requestOptions = getRequestOptions('PUT');
    requestOptions.body = JSON.stringify({"AccessKey": document.getElementById("accessKeyTextbox").value});
    fetch(url, requestOptions)
        .then(response => response.json())
        .then(function(data) {
            if (data.body === 'true') {
                if (searchType === 'criteria') {
                    searchUsingCriteria();
                } else if (searchType === 'title') {
                    searchUsingTitle();
                }
            }
        })
        .catch(error => console.log("error", error));
}

//Utility
function swapJsonKeysAndValues(json) {
    let ret = {};
    for(let key in json){
        ret[json[key]] = key;
    }
    return ret;
}

//Utility
function alphaSortJson(json) {
    let jsonList = Object.keys(json);
    let ret = {};
    jsonList.sort();
    for (let i in jsonList) {
        ret[jsonList[i]] = json[jsonList[i]];
    }
    return ret;
}