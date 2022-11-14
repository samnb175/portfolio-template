//Returns an array of html elements
function createHtmlEle(ele, numOfEle, eleClass = null) {
    let arrOfElements = [];
    for(let i = 0; i < numOfEle; i++) {
        arrOfElements.push(document.createElement(ele));       
    }
    if(eleClass) {
        for(let element of arrOfElements) {
            element.classList.add(eleClass);
        }
    }

    return arrOfElements;    
}

export {createHtmlEle}