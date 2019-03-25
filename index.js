'use strict';

const apiKey = '6Wzcjab7S4IeGCA4OB2zY0JPxfU3PwZq';

//display bestsellers list on load
function displayBestSellers(responseJson) {
    $('section').empty();

    const responseBooks = responseJson.results.books;
    let bestSellersString = "";

    for (let i = 0; i <responseBooks.length; i++) {
        bestSellersString +=
            `<article id="${i}">
                <img src="${responseBooks[i].book_image}">
                <div class="item-details">
                    <h4>${responseBooks[i].title}</h4>
                    <h5>${responseBooks[i].author}</h5>
                </div>
                <div class="icons">
                    <a class="fas fa-newspaper" href="${responseBooks[i].book_review_link}"></a>
                    <div class="divider"></div>
                    <a class="fas fa-shopping-cart buy" href="${responseBooks[i].amazon_product_url}" target="_blank"></a>
                </div>
            </article>`;
    }

    $('section').append(bestSellersString);

}

function formatFictionString(paramsFiction) {
    const fictionItems = `${paramsFiction.date}/${paramsFiction.list}.json?api-key=${paramsFiction.api_key}`;
    return fictionItems;
}

function determineDate() {
    let dateSelected = $('input[name=date-selector]:checked').val();
    let dateString = new Date();

    if (dateSelected === "Current week") {
        dateString = "current";
        return dateString;
    } 
    else if (dateSelected === "Last month") {
        dateString = dateString.setDate(dateString.getDate() - 30);
        dateString = new Date(dateString).toISOString().split("T")[0];
        return dateString;
    }
    else if (dateSelected === "3 months ago") {
        dateString= dateString.setDate(dateString.getDate() - 90);
        dateString = new Date(dateString).toISOString().split("T")[0];
        return dateString;        
    }
    else {
        dateString = dateString.setDate(dateString.getDate() - 365);
        dateString = new Date(dateString).toISOString().split("T")[0];
        return dateString;
    }
    
}

function viewOlderLists(key) {
    $('form').submit(event => {
        event.preventDefault();
        getBestSellers(apiKey);
    })
}

//fetch bestsellers list data from New York Times API
function getBestSellers(key) {
    
    //combined print and ebook fiction
    const paramsFiction = {
        api_key: apiKey,
        list: "combined-print-and-e-book-fiction",
        date: determineDate()
    };

    //format url strings
    const fictionString = formatFictionString(paramsFiction);

    //combine url strings for fiction
    const fictionUrl = `https://api.nytimes.com/svc/books/v3/lists/${fictionString}`;

    fetch(fictionUrl) 
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayBestSellers(responseJson))
        .catch(error => $('section').append(error.message));
}

function handler() {
    getBestSellers(apiKey);
    viewOlderLists(apiKey);
    enableModal();
    closeModal();
}

$(handler);