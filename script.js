document.addEventListener('DOMContentLoaded', () => {
    const imeiInput = document.getElementById('imeiInput');
    const checkButton = document.getElementById('checkButton');
    const resultsDiv = document.getElementById('results');
    const loader = document.getElementById('loader');

    // URL da sua implantação do Google Apps Script
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPmkfA2JCI0CXoTjMRxOE_ATYmNMc1jIS2C2fqcM0FYJa_nXIC3RraEVkRZzJko3_zlQ/exec';

    checkButton.addEventListener('click', checkImei);
    imeiInput.addEventListener('keyup', (event) => { if (event.key === 'Enter') checkImei(); });

    async function checkImei() {
        const imei = imeiInput.value.trim();
        
        if (!/^\d{14,15}$/.test(imei)) {
            displayError('Please enter a valid IMEI (14 or 15 digits).');
            return;
        }

        const tac = imei.substring(0, 8);
        resultsDiv.innerHTML = '';
        loader.classList.remove('hidden');

        try {
            /**
             * STEP 1: Local Lookup
             * We search our Google Sheet first to avoid API costs.
             */
            console.log('Searching local database...');
            const localUrl = `${GOOGLE_SCRIPT_URL}?action=lookupLocal&tac=${tac}`;
            
            let response = await fetch(localUrl);
            let result = await response.json();

            if (result.status === 'found') {
                displayResults(result.data, result.source);
                return; // STOP HERE - No cost incurred
            }
            
            /**
             * STEP 2: External Lookup (The Costly Part)
             * Only executes if the TAC is not found in the Google Sheet.
             */
            console.log('Local miss. Requesting external search via proxy...');
            const externalUrl = `${GOOGLE_SCRIPT_URL}?action=lookupExternal&imei=${imei}`;
            
            response = await fetch(externalUrl);
            result = await response.json();

            if (result.status === 'found') {
                displayResults(result.data, result.source);
            } else {
                // Displays "IMEI not found in the external database" or API errors
                displayError(result.message);
            }

        } catch (error) {
            console.error('Fetch error:', error);
            displayError('Connection failed. Please check your connection.');
        } finally {
            loader.classList.add('hidden');
        }
    }

    function displayResults(data, source) {
        const deviceName = `${data.brand} ${data.model}`;
        // Highlights source in green if local (free) or orange if external (paid)
        const sourceColor = source.includes('Local') ? '#28a745' : '#e67e22';
        
        let content = `
            <h2>${deviceName}</h2>
            <p style="font-size: 0.9em; color: ${sourceColor};">
                <strong>Source: ${source}</strong>
            </p>
            <ul>
                <li><strong>Brand:</strong> ${data.brand}</li>
                <li><strong>Model:</strong> ${data.model}</li>
            </ul>
        `;
        resultsDiv.innerHTML = content;
    }

    function displayError(message) {
        resultsDiv.innerHTML = `<p class="error">${message || 'No information found for this IMEI.'}</p>`;
    }
});
