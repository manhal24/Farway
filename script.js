async function startDownload() {
    const tiktokUrl = document.getElementById('tiktokUrl').value;
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');

    resultDiv.innerHTML = '';
    loadingDiv.style.display = 'block';

    // Make sure to replace 'YOUR_APIFY_API_TOKEN' with your actual Apify API token
    const apifyApiUrl = 'https://api.apify.com/v2/actor-tasks/QKSVyK33mh6MeAu4z/runs?token=apify_api_pF306vaVsrrkxbvFybpHEUyx8fHKk01XKgoa';

    const response = await fetch(apifyApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "startUrls": [{ "url": tiktokUrl }]
        }),
    });

    const data = await response.json();
    const runId = data.data.id;

    // Wait 30 seconds or poll the status every few seconds
    await waitForActorCompletion(runId);

    // Fetch dataset results after the actor completes
    const datasetUrl = `https://api.apify.com/v2/datasets/${runId}/items?token=apify_api_pF306vaVsrrkxbvFybpHEUyx8fHKk01XKgoa`;
    const datasetResponse = await fetch(datasetUrl);
    const dataset = await datasetResponse.json();

    loadingDiv.style.display = 'none';

    // Parse the dataset for Cover (image) and DownAddr (video download link)
    const { Cover, DownAddr } = dataset[0];  // Assuming the first result contains the info

    // Display the result in the HTML
    resultDiv.innerHTML = `
        <img src="${Cover}" alt="Video cover" class="thumbnail" />
        <br />
        <a href="${DownAddr}" target="_blank" download>
            <button>Download Video</button>
        </a>
    `;
}

async function waitForActorCompletion(runId) {
    let isCompleted = false;
    const apiUrl = `https://api.apify.com/v2/actor-runs/${runId}?token=apify_api_pF306vaVsrrkxbvFybpHEUyx8fHKk01XKgoa`;

    // Poll every 5 seconds until the actor completes
    while (!isCompleted) {
        const response = await fetch(apiUrl);
        const runInfo = await response.json();

        if (runInfo.data.status === 'SUCCEEDED') {
            isCompleted = true;
        } else {
            await new Promise(resolve => setTimeout(resolve, 5000));  // Wait 5 seconds
        }
    }
}
