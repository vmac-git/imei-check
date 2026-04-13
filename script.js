document.addEventListener('DOMContentLoaded', () => {
    const imeiInput = document.getElementById('imeiInput');
    const checkButton = document.getElementById('checkButton');
    const resultsDiv = document.getElementById('results');
    const loader = document.getElementById('loader');

    // URL do seu Google Apps Script (v9.0)
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyTOcNwmEmfteglypID5LBZJ8hJL7bLjilmxJr7KrnhOMbtEMizRsqPL0NqLYrLMmcTHg/exec';

    checkButton.addEventListener('click', checkImei);
    imeiInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') checkImei(); });

    async function checkImei() {
        const imei = imeiInput.value.trim();
        
        if (!/^\d{14,15}$/.test(imei)) {
            displayError('Please enter a valid IMEI (14-15 digits).');
            return;
        }

        resultsDiv.innerHTML = '';
        loader.classList.remove('hidden');

        try {
            // Chamada única ao backend (que já gerencia local vs externo)
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?imei=${imei}`);
            const result = await response.json();

            if (result.status === 'found') {
                displayResults(result.data, result.source);
            } else {
                displayError(result.message || 'IMEI not found.');
            }
        } catch (error) {
            displayError('Connection failed. Please check permissions.');
        } finally {
            loader.classList.add('hidden');
        }
    }

    function displayResults(data, source) {
        const isFree = source.includes("Local");
        const themeColor = isFree ? '#48bb78' : '#3182ce'; 
        const sourceLabel = isFree ? 'DATABASE MATCH' : 'EXTERNAL LOOKUP';

        resultsDiv.innerHTML = `
            <div style="animation: fadeIn 0.4s ease-out; text-align: left;">
                <div style="text-align: center; margin-bottom: 15px;">
                    <span style="
                        background: ${themeColor}20;
                        color: ${themeColor};
                        padding: 4px 12px;
                        border-radius: 4px;
                        font-size: 0.7rem;
                        font-weight: bold;
                        border: 1px solid ${themeColor}40;
                        text-transform: uppercase;
                    ">
                        ${sourceLabel}
                    </span>
                </div>

                <div style="
                    background-color: #1a202c; 
                    border: 1px solid #4a5568;
                    border-radius: 12px;
                    overflow: hidden;
                ">
                    <div style="padding: 15px; border-bottom: 1px solid #4a5568; background: rgba(255,255,255,0.02);">
                        <h2 style="margin: 0; font-size: 1.2rem; color: #ffffff; text-align: center;">
                            ${data.brand} ${data.model}
                        </h2>
                    </div>

                    <div style="padding: 5px;">
                        <div style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #2d3748;">
                            <span style="color: #a0aec0; font-size: 0.85rem;">BRAND</span>
                            <span style="color: #f7fafc; font-weight: bold;">${data.brand}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 12px;">
                            <span style="color: #a0aec0; font-size: 0.85rem;">MODEL</span>
                            <span style="color: #f7fafc; font-weight: bold;">${data.model}</span>
                        </div>
                    </div>
                </div>

                <p style="margin-top: 12px; font-size: 0.7rem; color: #718096; text-align: center;">
                    Source: <span style="color: ${themeColor}; font-weight: 600;">${source}</span>
                </p>
            </div>

            <style>
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>
        `;
    }

    function displayError(msg) {
        resultsDiv.innerHTML = `<p class="error">${msg}</p>`;
    }
});
