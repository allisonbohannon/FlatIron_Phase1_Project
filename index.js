document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const searchType = document.querySelector('select').value
        const searchTerm = document.querySelector('#input-data').value
        getSearchResults(searchType, searchTerm); 
    })
}); 


//After a user has entered data in the search form, request openlibrary API for results
function getSearchResults(searchType, searchTerm) {
    const parsedSearch = `${parsedSearchType(searchType)}=${searchTerm.split(' ').join('+')}`
    fetch(`http://openlibrary.org/search.json?${parsedSearch}`)
    .then(response => response.json())
    .then(searchResults => renderSearchResults(searchResults.docs))
};
//Search parameter is based on whether user is searching by title, author, or subject 
function parsedSearchType(searchType) {
    let parsedType; 
    switch(searchType) {
        case 'author': 
            parsedType = 'author';
            break;
        case 'title': 
            parsedType = 'title';
            break;
        default: 
            parsedType = 'q';
            break;
    }
    return parsedType;
}
//Parent function for rendering search results to ensure clean data and alert user if no results
//Clean up data by ensuring that all title/author combos are only displayed once
//Clean up data by ensuring all entries have an ISBN
function renderSearchResults(results) {
    if(results.length === 0) {
        document.getElementById('search-results').textContent = 'no results'; 
    } else {
        document.getElementById('search-results').textContent = ''; 
        const resultsContainer = document.getElementById('search-results'); 
        removeAllChildNodes(resultsContainer);
        const displayedResults = [];
        results.forEach(result => {
            const titleAuthor = {
                title: result.title, 
                author: result.author_name,
            }
            if(!displayedResults.includes(titleAuthor) && Array.isArray(result.isbn)) {
                renderSearchResult(result)
                displayedResults.push(titleAuthor)
            }
        })
    }
}; 

//Render individual, non persisting cards to display search results
//Each card has two buttons: one to add to a want to read list, the other to an already read list
//The card id is the book's isbn, which will be used as a key to add a book to the other lists
function renderSearchResult(result) {
    const resultCard = document.createElement('li'); 
    resultCard.className = 'result-card'
    resultCard.id = `${result.isbn[0]}`
    resultCard.innerHTML = `
        <p><strong>Title: <em>${result.title}</em></strong></h3>
        <p><strong>Author(s)</strong>: ${result.author_name}</h3>
        <p id = 'published-year' ><strong>Published:</strong> ${result.first_publish_year}</p>
        <button class = 'want-to-read-button'>want to read</button>
        <button class = 'already-read-buttton'>already read</button>
    `
    resultCard.querySelector('.want-to-read-button').addEventListener('click', (e) => {
        const isbn = e.target.parentNode.id; 
        fetchWantToRead(isbn); 
    })
    /*resultCard.querySelector('.already-read-button').addEventListener('click', (e) => {
        const isbn = e.target.parentNode.id; 
        addAlreadyRead(isbn); 
    })*/
    document.getElementById('search-results').appendChild(resultCard);
};

//Clean up search results when entering a new search
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function fetchWantToRead(isbn) {
    fetch(`http://openlibrary.org/search.json?q=${isbn}`)
    .then(response => response.json())
    .then(searchResults => postWantToRead(searchResults.docs[0]))
}; 

function postWantToRead(result) {
    const wantToReadObj = {
        title: result.title,
        author: result.author_name, 
        pages: result.number_of_pages_median, 
        yearPublished: result.first_publish_year, 
        subjects: result.subject,
        isbn: result.isbn[0]
    }; 
    console.log(wantToReadObj)
    fetch('http://localhost:3000/wants', {
        method:'POST', 
        headers:{ "Content-Type": "application/json",
        Accept: "application/json"},
        body: JSON.stringify(wantToReadObj),
    })
    .then(response => response.json())
    .then(data => renderWantToRead(data)); 
}

function renderWantToReadList() {
    //initiate list; potentially create blocker to keep from adding dupes 
}

function renderWantToRead(result) {
    const wantToReadCard = document.createElement('li');
    wantToReadCard.innerHTML = `
        <p><strong>Title: <em>${result.title}</em></strong></h3>
        <p><strong>Author(s)</strong>: ${result.author}</h3>
    `
    document.querySelector('.want-to-read-container').appendChild(wantToReadCard); 
}; 

function addAlreadyRead(isbn) {}; 

function renderAlreadyRead(result) {}; 
