document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const searchType = document.querySelector('select').value
        const searchTerm = document.querySelector('#input-data').value
        console.log(searchType, searchTerm)
        getSearchResults(searchType, searchTerm); 
    })
}); 

function getSearchResults(searchType, searchTerm) {
    const parsedSearch = `${parsedSearchType(searchType)}=${searchTerm.split(' ').join('+')}`
    console.log(parsedSearch)
    fetch(`http://openlibrary.org/search.json?${parsedSearch}`)
    .then(response => response.json())
    .then(searchResults => renderSearchResults(searchResults.docs))
};

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

function renderSearchResults(results) {
    const resultsContainer = document.getElementById('search-results'); 
    removeAllChildNodes(resultsContainer);
    const displayedResults = [];
    results.forEach(result => {
        const titleAuthor = {
            title: result.title, 
            author: result.author_name,
        }
        if(!displayedResults.includes(titleAuthor)) {
            renderSearchResult(result)
            displayedResults.push(titleAuthor)
        }
     //add in an if statement to print 'No results' if displayedResults is empty   
    })
}; 

function renderSearchResult(result) {
    
    const resultCard = document.createElement('li'); 
    resultCard.innerHTML = `
        <h3>Title: ${result.title}</h3>
        <h3>Author(s): ${result.author_name}</h3>
        <p id = 'published-year' >Published: ${result.first_publish_year}</p>
        <p id = 'pages' class = 'hidden'>Pages: ${result.number_of_pages_median}</p>
        <p id = 'subjects' class = 'hidden'>Subjects: ${result.subject}</p>
    `
    document.getElementById('search-results').appendChild(resultCard);
};

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}