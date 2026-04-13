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
    const themeColor = isFree ? '#27ae60' : '#e67e22'; // Verde para grátis, Laranja para pago
    const sourceLabel = isFree ? 'DATABASE MATCH' : 'EXTERNAL LOOKUP';

    resultsDiv.innerHTML = `
        <div class="result-card" style="
            border-left: 6px solid ${themeColor};
            background: #fff;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            max-width: 450px;
            margin: 20px auto;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            animation: fadeIn 0.5s ease;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <span style="
                    background: ${themeColor}15;
                    color: ${themeColor};
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: bold;
                    letter-spacing: 1px;
                    border: 1px solid ${themeColor}30;
                ">
                    ${sourceLabel}
                </span>
                <small style="color: #999;">${new Date().toLocaleDateString()}</small>
            </div>

            <h2 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 1.5rem;">${data.brand}</h2>
            <h3 style="margin: 0 0 20px 0; color: #7f8c8d; font-weight: 400; font-size: 1.1rem;">${data.model}</h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div style="background: #f8f9fa; padding: 10px; border-radius: 8px;">
                    <label style="display: block; font-size: 0.7rem; color: #95a5a6; text-transform: uppercase;">Brand</label>
                    <strong style="color: #2c3e50;">${data.brand}</strong>
                </div>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 8px;">
                    <label style="display: block; font-size: 0.7rem; color: #95a5a6; text-transform: uppercase;">Model</label>
                    <strong style="color: #2c3e50;">${data.model}</strong>
                </div>
            </div>

            <div style="margin-top: 15px; font-size: 0.8rem; color: #95a5a6; text-align: center;">
                Source: <span style="color: ${themeColor}; font-weight: 600;">${source}</span>
            </div>
        </div>

        <style>
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
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
