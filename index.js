'use strict';

const apiKey = '6Wzcjab7S4IeGCA4OB2zY0JPxfU3PwZq';

function enableModal() {
    $('.quotes').click(function() {
        let modalID = $(this).parent().attr('id'); 
        $('.overlay').toggleClass('hidden');
        $('.modal').toggleClass('hidden');
        getQuotes(modalID);
    })
}

function closeModal() {
    $('#close-modal').click(function() {
        $('#modal-content').empty();
        $('.modal').addClass('hidden');
        $('.overlay').addClass('hidden');
    })
}

//display quotes
function displayQuotes(quotesJson, bookAuthor) {
    
    const bookQuotes = quotesJson.quotes;
    let quotesCount  = 0;
    let quotesString = "";

    for (let i = 0; i < bookQuotes.length; i++) {
        if (bookQuotes[i].author === bookAuthor) {
            quotesString += 
                `<blockquote>
                    ${bookQuotes[i].quote}
                    <footer>- ${bookQuotes[i].author}, from "${bookQuotes[i].publication}"</footer>
                </blockquote>`;
            quotesCount++;
        }
    }
    $('#modal-content').append(quotesString);
    
    if (quotesCount === 0) {
        closeModal();
        return $('#modal-content').append(`<p>We do not have quotes for this book yet.</p>`);
    }

    closeModal();
}

function getQuotes(id) {

    //get title of responseBooks and create a url string for the quotes API
    
    let articles = $('article').toArray();

    for (let i = 0; i < articles.length; i++) {
        if (id === articles[i].id) {
            const bookTitle = articles[i].firstElementChild.nextElementSibling.innerText.split(' ');
            const bookAuthor = articles[i].firstElementChild.nextElementSibling.nextElementSibling.innerText;
            const joinTitle = bookTitle.join('+');
            const quotesAppUrl = 'https://goodquotesapi.herokuapp.com/title/';
            const quotesQuery = `${quotesAppUrl}${joinTitle}`;

            
            fetch(quotesQuery)
            .then(quotesResponse => {
                if (quotesResponse.ok) {
                    return quotesResponse.json();
                }
                throw new Error(response.statusText);
            })
            .then(quotesJson => displayQuotes(quotesJson, bookAuthor))
            .catch(error => $('#modal-content').append(`<p>We do not have quotes for this book yet.</p>`));
        }
    }
}

//display bestsellers list on load
function displayBestSellers(responseJson) {
    $('section').empty();

    const responseBooks = responseJson.results.books;
    let bestSellersString = "";

    for (let i = 0; i <responseBooks.length; i++) {
        bestSellersString +=
            `<article id="${i}">
                <img src="${responseBooks[i].book_image}">
                <h4>${responseBooks[i].title}</h4>
                <h5>${responseBooks[i].author}</h5>
                <a class="button quotes">Quotes</a>
                <a class="button buy" href="${responseBooks[i].amazon_product_url}" target="_blank">Buy</a>
            </article>`;
    }

    $('section').append(bestSellersString);
    
    enableModal();
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
}

handler();