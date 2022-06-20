const readList= []; 

document.addEventListener('DOMContentLoaded', () => {
    updateStats(); 
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
                author: result.author_name[0],
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
    const url = `https://covers.openlibrary.org/b/ISBN/${result.isbn[0]}-M.jpg`
    const resultCard = document.createElement('li'); 
    resultCard.className = 'result-card'
    resultCard.id = result.isbn[0]
    resultCard.innerHTML = `
        <h4><strong>Title: <em>${result.title}</em></strong></h3>
        <p><strong>Author(s)</strong>: ${result.author_name}</h3>
        <p class = 'published-year' >Published: ${result.first_publish_year}</p>
        <button class = 'add-read-button'>add read</button>
    `
    resultCard.querySelector('.add-read-button').addEventListener('click', (e) => {
        const isbn = e.target.parentNode.id; 
        if (checkIfAlreadyOnList(isbn) === true) {
            fetchRead(isbn) 
        } else {
            alert('book already added!')
        }
    }); 

    document.getElementById('search-results').appendChild(resultCard);
};

//Clean up search results when entering a new search
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function fetchRead(isbn) {
    fetch(`http://openlibrary.org/search.json?q=${isbn}`)
    .then(response => response.json())
    .then(searchResults => addRead(searchResults.docs[0]))
}; 

function checkIfAlreadyOnList(isbn) {
    for (book of readList) {
        if (book.id === isbn) {
            return false; 
        }
    }
    return true; 
}

function addRead(result) {
    const book = {
        title: result.title,
        author: result.author_name, 
        pages: result.number_of_pages_median, 
        yearPublished: result.first_publish_year, 
        subjects: result.subject,
        id: result.isbn[0]
    }; 
    readList.push(book); 
    renderRead(book); 
    updateStats(); 
}; 

function renderRead(book) {
    const readCard = document.createElement('div');
        readCard.className = 'read-card'; 
        readCard.id = book.id; 
        readCard.innerHTML = `
            <button class = 'delete'> X </button> 
            <div class = 'card-header'>
                <p><strong>Title: <em>${book.title}</em></strong></h3>
                <p><strong>Author(s)</strong>: ${book.author}</h3>
            <div>
            
           
            `
    
    readCard.querySelector('.delete').addEventListener('click', (e) => {
        deleteRead(e.target.parentNode.id)
        e.target.parentNode.parentNode.removeChild(e.target.parentNode); 
    }); 
    document.querySelector('.read-container').appendChild(readCard); 
}; 

function deleteRead(id) {
    const deleteIndex = readList.findIndex(bookObj => bookObj.id === id); 
    readList.splice(deleteIndex, 1); 
    updateStats(); 
}; 

function updateStats() {
    document.querySelector('#books-read').textContent = `books read: ${booksRead()}`
    document.querySelector('#total-pages').textContent = `total pages: ${pagesRead()}`
    document.querySelector('#average-years').textContent = `average book age: ${averageAge()}`
    favSubjects(); 
}

function booksRead() {
    return readList.length; 
}

function pagesRead() {
    return readList.reduce((a, b) => a + b.pages, 0)
}

function averageAge() {
    if (readList.length === 0) {
        return ''
    }

    const ageArray = []; 
    const today = new Date(); 
    const thisYear = today.getFullYear(); 

    for (book of readList) {
        ageArray.push(thisYear - book.yearPublished)
    }

    return `${Math.round(ageArray.reduce((a,b) => a + b, 0) / ageArray.length)} years`; 
}
//Find the subject with the highest frequency of occurences in the list of books
function favSubjects() {
    
    removeAllChildNodes(document.querySelector('#favorite-subjects-list'))

    if (readList.length === 0) {
        return ''
    }

    let subjectArray = []; 
    let subjectFrequency = []
   
    //create a flattened array of subjects, as each books subject is returned as an array
    for (book of readList) {
        if (book.subjects === undefined) {
        } else {
            for (subject of book.subjects) {
                subjectArray.push(subject)
            }  
        }    
    }
    console.log(subjectArray.length)
    //create a list that removes duplicates; iterate through the deDuped array to find how often each subject occurs in the total subject list
    //Create an array of objects that holds subject + frequency data
    if (subjectArray.length === 0) {
        return ''
    }
    let deDupedList = []
    for (subject of subjectArray) {
        
        if (! deDupedList.includes(subject)) {
            deDupedList.push(subject)
            const count = subjectArray.filter(index => index === subject ).length; 
            const subjObj = {
                subject: subject, 
                count: count,
            }
            subjectFrequency.push(subjObj)
        }
    }
    console.log(subjectFrequency)

    //loop through frequency calcs 5x to find the top subject, delete winner from array to find next most frequent
    for (let i = 0; i < 5; i++) {
    //Create an array of frequencies to find the max
        const countArray = []; 
        subjectFrequency.forEach(subject => {
            countArray.push(subject.count);
        })


        //Find the subject matching the frequency in the array of objects
        const maxCount = Math.max(...countArray)
        const index = subjectFrequency.findIndex(subject => subject.count === maxCount); 
        
        const freqSubject = subjectFrequency[index].subject; 
        
        subjectFrequency.splice(index, 1); 
       

        const freqLi = document.createElement('li'); 
        freqLi.textContent = `${i+1} : ${freqSubject}`; 
        document.querySelector('#favorite-subjects-list').appendChild(freqLi); 
    }
}
 





//Ideas for future: 
    // add sort functions on each list (A/Z by Author, by Title)
    // add Star ratings when marking a book read, show have read sorted by rank

