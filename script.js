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
        // Define a cor: Verde para Local (Economia), Laranja para API (Custo)
        const isFree = source.includes("Local");
        const sourceColor = isFree ? '#27ae60' : '#e67e22';
        
        resultsDiv.innerHTML = `
            <div style="border: 2px solid ${sourceColor}; padding: 15px; border-radius: 8px; background-color: #f9f9f9;">
                <h2 style="margin-top:0; color: #333;">${data.brand} ${data.model}</h2>
                <p style="color: ${sourceColor}; font-weight: bold; font-size: 1.1em;">
                    Source: ${source}
                </p>
                <hr style="border: 0; border-top: 1px solid #ddd;">
                <p><strong>Brand:</strong> ${data.brand}</p>
                <p><strong>Model:</strong> ${data.model}</p>
            </div>
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
