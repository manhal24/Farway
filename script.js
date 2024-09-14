async function startDownload() {
    const tiktokUrl = document.getElementById('tiktokUrl').value;
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');

    resultDiv.innerHTML = '';
    loadingDiv.style.display = 'block';

    // Updated API URL for direct actor run
    const apifyApiUrl = 'https://api.apify.com/v2/acts/D7laS3Cq1meds1VWx/runs';

    // Sending request with correct headers and body
    const response = await fetch(apifyApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer apify_api_pF306vaVsrrkxbvFybpHEUyx8fHKk01XKgoa' // Your API key
        },
        body: JSON.stringify({
            "start_urls": [
                { "url": tiktokUrl }
            ]
        }),
    });

    const data = await response.json();

    if (data.error) {
        alert(`Error: ${data.error.message}`);
        loadingDiv.style.display = 'none';
        return;
    }

    const runId = data.data.id;

    // Wait for actor completion
    await waitForActorCompletion(runId);

    // Extract dataset ID from the run info
    const datasetId = data.data.defaultDatasetId;
    
    // Fetch dataset results after the actor completes
    const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items`;
    const datasetResponse = await fetch(datasetUrl, {
        headers: {
            'Authorization': 'Bearer apify_api_pF306vaVsrrkxbvFybpHEUyx8fHKk01XKgoa' // Your API key
        }
    });
    const dataset = await datasetResponse.json();

    loadingDiv.style.display = 'none';

    // Parse the dataset for cover (image) and downAddr (video download link)
    const cover = dataset[0].cover;
    const downAddr = dataset[0].downAddr;

    // Display the result in the HTML
    resultDiv.innerHTML = `
        <img src="${cover}" alt="Video cover" class="thumbnail" />
        <br />
        <a href="${downAddr}" target="_blank" download>
            <button>Download Now</button>
        </a>
    `;
}

async function waitForActorCompletion(runId) {
    let isCompleted = false;
    const apiUrl = `https://api.apify.com/v2/actor-runs/${runId}`;

    // Poll every 5 seconds until the actor completes
    while (!isCompleted) {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': 'Bearer apify_api_pF306vaVsrrkxbvFybpHEUyx8fHKk01XKgoa' // Your API key
            }
        });
        const runInfo = await response.json();

        if (runInfo.data.status === 'SUCCEEDED') {
            isCompleted = true;
        } else {
            await new Promise(resolve => setTimeout(resolve, 5000));  // Wait 5 seconds
        }
    }
            }
