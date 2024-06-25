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
    .then(response => response.json())
    .then(data => {
        // Clear previous results
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = '';

        // Create new cards for each flight offer
        data.forEach(flight => createFlightCard(flight, resultsContainer));
    })
    .catch(error => console.error('Error during flight search:', error));
});

function createFlightCard(flight, container) {
    fetch('flightCardTemplate.html')
        .then(response => response.text())
        .then(template => {
            const itinerary = flight.itineraries[0].segments[0];
            let cardHTML = template
                .replace('{{departureIataCode}}', itinerary.departure.iataCode)
                .replace('{{arrivalIataCode}}', itinerary.arrival.iataCode)
                .replace('{{departureTime}}', itinerary.departure.at.substring(11, 16))
                .replace('{{arrivalTime}}', itinerary.arrival.at.substring(11, 16))
                .replace('{{duration}}', itinerary.duration.substring(2).toLowerCase())
                .replace('{{flightNumber}}', itinerary.number)
                .replace('{{carrierCode}}', itinerary.carrierCode)
                .replace('{{price}}', flight.price.grandTotal)
                .replace('{{seatsAvailable}}', flight.numberOfBookableSeats);

            const card = document.createElement('div');
            card.className = 'card col-md-4';
            card.innerHTML = cardHTML;
            container.appendChild(card);
        })
        .catch(error => console.error('Error loading the template:', error));
}

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

    fetch('http://127.0.0.1:5000/search_locations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyword: keyword, limit: 5 })
    })
    .then(response => response.json())
    .then(data => {
        const list = document.getElementById(listId);
        list.innerHTML = '';
        if (Array.isArray(data)) {
            data.forEach(location => {
                const item = document.createElement('a');
                item.className = 'dropdown-item';
                item.innerText = `${location.name} (${location.iataCode})`;
                item.onclick = () => {
                    input.value = `${location.iataCode}`;
                    list.innerHTML = '';
                    list.style.display = 'none';
                };
                list.appendChild(item);
            });
            list.style.display = 'block';
        } else {
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
