// This function fetches nearby places from the backend server
function fetchNearbyPlaces(latitude, longitude) {
    // Construct the URL to your FastAPI backend
    const url = `http://127.0.0.1:8000/find_places?latitude=${latitude}&longitude=${longitude}`;

    // Fetch the data from the backend
    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.results) {
            displayResults(data.results);
        } else {
            console.error('Failed to load places:', data.status);
        }
    })
    .catch(error => console.error('Error:', error));
}

// This function displays the results in the HTML page
function displayResults(places) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results
    places.forEach(place => {
        const name = place.name;
        const rating = place.rating || 'Rating not available';
        resultsContainer.innerHTML += `<p>${name} - Rating: ${rating}</p>`;
    });
}

// This function gets the user's current location and calls fetchNearbyPlaces
function getLocationAndPlaces() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            fetchNearbyPlaces(position.coords.latitude, position.coords.longitude);
        }, error => {
            console.error('Geolocation error:', error);
            alert('Error getting location: ' + error.message);
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        alert('Geolocation is not supported by your browser.');
    }
}

// Initialize the process when the script loads
getLocationAndPlaces();
