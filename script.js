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
            'Authorization': 'Bearer apify_api_pF306vaVsrrkxbvFybpHEUyx8fHKk01XKgoa'
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

    // Fetch dataset results after the actor completes
    const datasetUrl = `https://api.apify.com/v2/datasets/${runId}/items`;
    const datasetResponse = await fetch(datasetUrl, {
        headers: {
            'Authorization': 'Bearer apify_api_pF306vaVsrrkxbvFybpHEUyx8fHKk01XKgoa'
        }
    });
    const dataset = await datasetResponse.json();

    loadingDiv.style.display = 'none';

    // Parse the dataset for Cover (image) and DownAddr (video download link)
    const { cover, downAddr } = dataset[0];

    // Display the result in the HTML
    resultDiv.innerHTML = `
        <img src="${cover}" alt="Video cover" class="thumbnail" />
        <br />
        <a href="${downAddr}" download="video.mp4">
            <button>Download Now</button>
        </a>
    `;
}

async function waitForActorCompletion(runId) {
    let isCompleted = false;
    const apiUrl = `https://api.apify.com/v2/actor-runs/${runId}`;

    // Poll every 2 seconds until the actor completes
    while (!isCompleted) {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': 'Bearer apify_api_pF306vaVsrrkxbvFybpHEUyx8fHKk01XKgoa'
            }
        });
        const runInfo = await response.json();

        if (runInfo.data.status === 'SUCCEEDED') {
            isCompleted = true;
        } else {
            await new Promise(resolve => setTimeout(resolve, 2000));  // Wait 2 seconds
        }
    }
                    }
