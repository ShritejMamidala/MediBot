async function fetchMedicalAdvice(query) {
    const response = await fetch('http://127.0.0.1:8000/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
    });
    return response.json();
}

// Example usage
fetchMedicalAdvice("What are the symptoms of a cold?")
    .then(data => console.log(data));

