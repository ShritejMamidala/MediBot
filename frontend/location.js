function initNearbySearch() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.log("User's position:", latitude, longitude);

            // Request the server to fetch nearby hospitals
            fetch(`/find_places?latitude=${latitude}&longitude=${longitude}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Data received from server:", data);
                    if (data.results) {
                        displayResults(data.results);
                    } else {
                        document.getElementById('results').innerHTML = "No results found.";
                    }
                })
                .catch(error => {
                    console.error("Fetch error:", error);
                    document.getElementById('results').innerHTML = "Error fetching places.";
                });
        }, (error) => {
            console.error("Geolocation error:", error);
            document.getElementById('results').innerHTML = "Unable to retrieve your location.";
        });
    } else {
        document.getElementById('results').innerHTML = "Geolocation is not supported by your browser.";
    }
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = "";
    results.forEach(place => {
        const name = place.name;
        const rating = place.rating ? place.rating : "No rating";
        resultsDiv.innerHTML += `<p>${name} - Rating: ${rating}</p>`;
    });
}

window.onload = initNearbySearch;
