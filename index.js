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
    .then(searchResults => console.log(searchResults))
};

function parsedSearchType(searchType) {
    let parsedType; 
    switch(searchType) {
        case 'author': parsedType = 'author';
        case 'title': parsedType = 'title';
        default: parsedType = 'q'
    }
    return parsedType;
}

function renderSearchResults() {}; 