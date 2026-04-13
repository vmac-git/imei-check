/**
 * @description Frontend otimizado para o fluxo do Código.gs v9.0.
 * O Backend agora decide se usa a base local ou a API paga.
 */
document.addEventListener('DOMContentLoaded', () => {
    const imeiInput = document.getElementById('imeiInput');
    const checkButton = document.getElementById('checkButton');
    const resultsDiv = document.getElementById('results');
    const loader = document.getElementById('loader');

    // Mantenha sua URL de implantação atualizada
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyTOcNwmEmfteglypID5LBZJ8hJL7bLjilmxJr7KrnhOMbtEMizRsqPL0NqLYrLMmcTHg/exec';

    checkButton.addEventListener('click', checkImei);
    imeiInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') checkImei(); });

    async function checkImei() {
        const imei = imeiInput.value.trim();
        
        // Validação básica de dígitos
        if (!/^\d{14,15}$/.test(imei)) {
            displayError('Please enter a valid IMEI (14-15 digits).');
            return;
        }

        resultsDiv.innerHTML = '';
        loader.classList.remove('hidden');

        try {
            /**
             * Chamada Única:
             * O Google Script vai:
             * 1. Olhar na aba 'Página1' (Grátis)
             * 2. Se não achar, vai na API imei.info (Pago)
             * 3. Se vier da API, ele salva no Sheets antes de responder.
             */
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?imei=${imei}`);
            const result = await response.json();

            if (result.status === 'found') {
                displayResults(result.data, result.source);
            } else {
                displayError(result.message || 'IMEI not found in database or API.');
            }

        } catch (error) {
            console.error("Erro na requisição:", error);
            displayError('Network error. Check your Google Script deployment and permissions.');
        } finally {
            loader.classList.add('hidden');
        }
    }

    function displayResults(data, source) {
    const isFree = source.includes("Local");
    const themeColor = isFree ? '#27ae60' : '#e67e22'; 
    const sourceLabel = isFree ? 'DATABASE MATCH' : 'EXTERNAL LOOKUP';

    resultsDiv.innerHTML = `
        <div class="result-container" style="
            max-width: 500px;
            margin: 30px auto;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            animation: fadeIn 0.4s ease-out;
            color: #333;
        ">
            <div style="text-align: center; margin-bottom: 15px;">
                <span style="
                    background: ${themeColor};
                    color: #fff;
                    padding: 4px 15px;
                    border-radius: 50px;
                    font-size: 0.65rem;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                ">
                    ${sourceLabel}
                </span>
            </div>

            <div style="
                border: 2px solid ${themeColor}40;
                border-radius: 12px;
                overflow: hidden;
                background: transparent;
            ">
                <div style="background: ${themeColor}10; padding: 15px; border-bottom: 1px solid ${themeColor}30; text-align: center;">
                    <h2 style="margin: 0; font-size: 1.4rem; color: #2c3e50;">Device Information</h2>
                </div>

                <div style="padding: 10px;">
                    <div style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #ddd;">
                        <span style="font-weight: 600; color: #7f8c8d;">Brand:</span>
                        <span style="color: #2c3e50; font-weight: bold;">${data.brand}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px;">
                        <span style="font-weight: 600; color: #7f8c8d;">Model:</span>
                        <span style="color: #2c3e50; font-weight: bold;">${data.model}</span>
                    </div>
                </div>
            </div>

            <div style="margin-top: 15px; text-align: center; font-size: 0.8rem; color: #7f8c8d;">
                Data retrieved via <strong style="color: ${themeColor};">${source}</strong>
            </div>
        </div>

        <style>
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.98); }
                to { opacity: 1; transform: scale(1); }
            }
        </style>
    `;
}

    function displayError(msg) {
        resultsDiv.innerHTML = `
            <div style="background-color: #fee; border: 1px solid #faa; padding: 10px; border-radius: 5px;">
                <p style="color:red; font-weight:bold; margin:0;">${msg}</p>
            </div>
        `;
    }
});
