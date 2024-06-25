// Check local storage to decide whether to show the session modal
$(document).ready(function() {
    if (!localStorage.getItem('sessionActive')) {
        $('#sessionModal').modal('show');
    }

    // Handle the form submission for creating a new session
    $('#newSessionForm').on('submit', function(e) {
        e.preventDefault();
        const userName = $('#userName').val();
        $.ajax({
            url: 'http://127.0.0.1:5000/create_session',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ userName: userName }),
            success: function(response) {
                localStorage.setItem('sessionActive', 'true'); // Set session active flag
                $('#sessionCodeDisplay').text(response.sessionCode); // Update session code display
                $('#sessionModal').modal('hide');
                alert('Session started. Your session code: ' + response.sessionCode);
            },
            error: function() {
                alert('Failed to create session.');
            }
        });
    });

    // Handle the form submission for joining an existing session
    $('#joinSessionForm').on('submit', function(e) {
        e.preventDefault();
        const sessionCode = $('#sessionCode').val();
        $.ajax({
            url: 'http://127.0.0.1:5000/join_session',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ sessionCode: sessionCode }),
            success: function(response) {
                localStorage.setItem('sessionActive', 'true'); // Set session active flag
                $('#sessionCodeDisplay').text(sessionCode); // Update session code display
                $('#sessionModal').modal('hide');
                alert('Joined session successfully.');
            },
            error: function() {
                alert('Session code does not exist.');
            }
        });
    });

    // Flight search form submission handling
    document.getElementById('searchForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const origin = document.getElementById('origin').value;
        const destination = document.getElementById('destination').value;
        const departure_date = document.getElementById('departure_date').value;
        const travellers = document.getElementById('travellers').value;

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
            const resultsContainer = document.getElementById('resultsContainer');
            resultsContainer.innerHTML = '';
            data.forEach(flight => createFlightCard(flight, resultsContainer));
        })
        .catch(error => console.error('Error during flight search:', error));
    });

    // Location suggestions debouncing
    document.getElementById('origin').addEventListener('input', function() {
        debouncedFetchSuggestions(this, 'origin-list');
    });

    document.getElementById('destination').addEventListener('input', function() {
        debouncedFetchSuggestions(this, 'destination-list');
    });
});

// Function to copy the session code to the clipboard
function copySessionCode() {
    const sessionCode = document.getElementById('sessionCodeDisplay').textContent;
    navigator.clipboard.writeText(sessionCode).then(() => {
        alert('Session code copied to clipboard!');
    }, (err) => {
        alert('Failed to copy session code: ', err);
    });
}

// Flight card creation from template
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

// Debounce function for location suggestions
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
