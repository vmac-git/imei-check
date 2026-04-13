document.addEventListener('DOMContentLoaded', () => {
    const imeiInput = document.getElementById('imeiInput');
    const checkButton = document.getElementById('checkButton');
    const resultsDiv = document.getElementById('results');
    const loader = document.getElementById('loader');

    // Cole a URL da sua implantação do Google Apps Script aqui
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
            // ETAPA 1: Tenta buscar na base local via Google Script
            const localUrl = `${GOOGLE_SCRIPT_URL}?action=lookupLocal&tac=${tac}`;
            let response = await fetch(localUrl);
            let result = await response.json();

            if (result.status === 'found') {
                displayResults(result.data, result.source);
                return; // Encerra, pois já encontrou na base local
            }
            
            // ETAPA 2: Se não encontrou, pede ao Google Script para buscar na API externa
            console.log('Local miss. Fetching from external proxy...');
            const externalUrl = `${GOOGLE_SCRIPT_URL}?action=lookupExternal&imei=${imei}`;
            response = await fetch(externalUrl);
            result = await response.json();

            if (result.status === 'found') {
                displayResults(result.data, result.source);
            } else {
                // Se o proxy retornar um erro, exibe a mensagem de erro
                displayError(result.message);
            }

        } catch (error) {
            displayError('Connection failed. Please retry.');
        } finally {
            loader.classList.add('hidden');
        }
    }

    function displayResults(data, source) {
        const deviceName = `${data.brand} ${data.model}`;
        let content = `
            <h2>${deviceName}</h2>
            <p style="font-size: 0.9em; color: #666;"><em>Source: ${source}</em></p>
            <ul>
                <li><strong>Brand:</strong> ${data.brand}</li>
                <li><strong>Model:</strong> ${data.model}</li>
            </ul>
        `;
        resultsDiv.innerHTML = content;
    }

    function displayError(message) {
        resultsDiv.innerHTML = `<p class="error">${message || 'Information for this IMEI is currently unavailable.'}</p>`;
    }
});
