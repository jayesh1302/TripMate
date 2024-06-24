document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const departure_date = document.getElementById('departure_date').value;
    const travellers = document.getElementById('travellers').value;

    console.log('Form Submitted', { origin, destination, departure_date, travellers });

    const searchData = {
        origin: origin,
        destination: destination,
        departure_date: departure_date,
        travellers: travellers
    };

    fetch('http://127.0.0.1:5000/search_flights', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchData)
    })
    .then(response => {
        console.log('Flight search response:', response);
        return response.json();
    })
    .then(data => {
        console.log('Flight search response data:', data);
        // Handle the response data here
    })
    .catch(error => console.error('Error during flight search:', error));
});

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

function fetchSuggestions(input, listId) {
    const keyword = input.value;
    if (keyword.length < 2) {
        document.getElementById(listId).innerHTML = '';
        document.getElementById(listId).style.display = 'none';
        return;
    }

    console.log(`Fetching suggestions for keyword: ${keyword}`);

    fetch('http://127.0.0.1:5000/search_locations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyword: keyword, limit: 5 })
    })
    .then(response => {
        console.log('Location search response:', response);
        return response.json();
    })
    .then(data => {
        console.log('Location search response data:', data);
        const list = document.getElementById(listId);
        list.innerHTML = '';
        if (Array.isArray(data)) {
            data.forEach(location => {
                console.log('Adding location to list:', location);
                const item = document.createElement('a');
                item.className = 'dropdown-item';
                item.innerText = `${location.name} (${location.iataCode})`;
                item.onclick = () => {
                    input.value = `${location.name} (${location.iataCode})`;
                    list.innerHTML = '';
                    list.style.display = 'none';
                };
                list.appendChild(item);
            });
            list.style.display = 'block';
        } else {
            console.log('No locations found or invalid data format:', data);
            list.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error during location search:', error);
        document.getElementById(listId).style.display = 'none';
    });
}

const debouncedFetchSuggestions = debounce(fetchSuggestions, 100);

document.getElementById('origin').addEventListener('input', function() {
    debouncedFetchSuggestions(this, 'origin-list');
});

document.getElementById('destination').addEventListener('input', function() {
    debouncedFetchSuggestions(this, 'destination-list');
});
