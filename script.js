/**
 * @description Frontend logic to minimize API costs by checking local database first.
 */
document.addEventListener('DOMContentLoaded', () => {
    const imeiInput = document.getElementById('imeiInput');
    const checkButton = document.getElementById('checkButton');
    const resultsDiv = document.getElementById('results');
    const loader = document.getElementById('loader');

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw3IrnlAg2IJ3bv49V8yysZf1KCEWrMzyrIRsxXlCsi6tB1ju_NsvjFVPgQsw9xwzlpYQ/exec';

    checkButton.addEventListener('click', checkImei);

    async function checkImei() {
        const imei = imeiInput.value.trim();
        if (!/^\d{14,15}$/.test(imei)) {
            displayError('Please enter a valid IMEI (14-15 digits).');
            return;
        }

        const tac = imei.substring(0, 8);
        resultsDiv.innerHTML = '';
        loader.classList.remove('hidden');

        try {
            // --- STEP 1: LOCAL SEARCH (FREE) ---
            console.log("Checking local spreadsheet...");
            const localResponse = await fetch(`${GOOGLE_SCRIPT_URL}?action=lookupLocal&tac=${tac}`);
            const localData = await localResponse.json();

            if (localData.status === 'found') {
                displayResults(localData.data, "Local Database (Free)");
                loader.classList.add('hidden');
                return; // INTERRUPÇÃO: Se achou local, não gasta dinheiro.
            }

            // --- STEP 2: EXTERNAL SEARCH (PAID) ---
            console.log("Not found locally. Fetching from External API...");
            const externalResponse = await fetch(`${GOOGLE_SCRIPT_URL}?action=lookupExternal&imei=${imei}`);
            const externalData = await externalResponse.json();

            if (externalData.status === 'found') {
                displayResults(externalData.data, "External API (imei.info)");
            } else {
                displayError(externalData.message || 'IMEI not found anywhere.');
            }

        } catch (error) {
            displayError('Network error. Check your Google Script deployment.');
        } finally {
            loader.classList.add('hidden');
        }
    }

    function displayResults(data, source) {
        const isFree = source.includes("Local");
        resultsDiv.innerHTML = `
            <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                <h2 style="margin-top:0;">${data.brand} ${data.model}</h2>
                <p style="color: ${isFree ? '#27ae60' : '#e67e22'}; font-weight: bold;">
                    Source: ${source}
                </p>
                <hr>
                <p><strong>Brand:</strong> ${data.brand}</p>
                <p><strong>Model:</strong> ${data.model}</p>
            </div>
        `;
    }

    function displayError(msg) {
        resultsDiv.innerHTML = `<p style="color:red; font-weight:bold;">${msg}</p>`;
    }
});
