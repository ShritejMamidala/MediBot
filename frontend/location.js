function initNearbySearch() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.log("User's position:", latitude, longitude);

            fetch(`/find_places?latitude=${latitude}&longitude=${longitude}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Data received from server:", data);
                    displayResults(data);
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

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous content

    // Create container for two columns
    const container = document.createElement('div');
    container.className = 'results-container';

    // Create hospitals column
    const hospitalsDiv = document.createElement('div');
    hospitalsDiv.className = 'hospitals';
    const hospitalsHeading = document.createElement('h2');
    hospitalsHeading.textContent = 'Hospitals';
    hospitalsDiv.appendChild(hospitalsHeading);

    if (data.hospitals && data.hospitals.length > 0) {
        data.hospitals.forEach(place => {
            const placeDiv = document.createElement('div');
            placeDiv.className = 'place';
            placeDiv.innerHTML = `
                <strong>${place.name}</strong><br>
                <strong>Distance (km):</strong> ${place.distance_km}<br>
                <strong>Rating:</strong> ${place.rating}<br>
                <strong>Website:</strong> <a href="${place.website}" target="_blank">${place.website}</a><br>
                <strong>Phone:</strong> ${place.phone}<br>
                <img src="${place.photo}" alt="Photo of ${place.name}" style="max-width:200px;">
            `;
            hospitalsDiv.appendChild(placeDiv);
        });
    } else {
        const noHospitals = document.createElement('p');
        noHospitals.textContent = 'No hospitals found.';
        hospitalsDiv.appendChild(noHospitals);
    }

    // Create doctors column
    const doctorsDiv = document.createElement('div');
    doctorsDiv.className = 'doctors';
    const doctorsHeading = document.createElement('h2');
    doctorsHeading.textContent = 'Doctors';
    doctorsDiv.appendChild(doctorsHeading);

    if (data.doctors && data.doctors.length > 0) {
        data.doctors.forEach(place => {
            const placeDiv = document.createElement('div');
            placeDiv.className = 'place';
            placeDiv.innerHTML = `
                <strong>${place.name}</strong><br>
                <strong>Distance (km):</strong> ${place.distance_km}<br>
                <strong>Rating:</strong> ${place.rating}<br>
                <strong>Website:</strong> <a href="${place.website}" target="_blank">${place.website}</a><br>
                <strong>Phone:</strong> ${place.phone}<br>
                <img src="${place.photo}" alt="Photo of ${place.name}" style="max-width:200px;">
            `;
            doctorsDiv.appendChild(placeDiv);
        });
    } else {
        const noDoctors = document.createElement('p');
        noDoctors.textContent = 'No doctors found.';
        doctorsDiv.appendChild(noDoctors);
    }

    // Append both columns to the container
    container.appendChild(hospitalsDiv);
    container.appendChild(doctorsDiv);
    resultsDiv.appendChild(container);
}

window.onload = initNearbySearch;
