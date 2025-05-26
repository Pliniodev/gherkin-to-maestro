function gherkinToMaestroYaml(gherkinText) {
    const lines = gherkinText.split('\n').map(line => line.trim());
    const steps = [];

    steps.push('appId: com.example.app');
    steps.push('---');

    lines.forEach(line => {
        if (line.startsWith('Given')) {
            const tela = line.match(/"([^"]+)"/);
            if (tela) steps.push(`- assertVisible: "${tela[1]}"`);
            else steps.push(`- launchApp`);
        }

        if (line.startsWith('When') || line.startsWith('And')) {

            // Espera fixa genérica "When espera" ou "When espera um momento"
            if (/^When espera( um momento)?$/i.test(line)) {
                steps.push(`- sleep: 5000`);
                return;
            }

            // Espera com segundos especificados "When espera 20 segundos"
            let m = line.match(/espera (\d+) segundos?/i);
            if (m) {
                const ms = parseInt(m[1], 10) * 1000;
                steps.push(`- sleep: ${ms}`);
                return;
            }

            // Preencher campo
            m = line.match(/preenche o campo "([^"]+)" com "([^"]+)"/);
            if (m) {
                steps.push(`- tapOn: "${m[1]}"`);
                steps.push(`- inputText: "${m[2]}"`);
                return;
            }

            // Clicar no botão ou elemento
            m = line.match(/clica no botão "([^"]+)"/);
            if (m) {
                steps.push(`- tapOn: "${m[1]}"`);
                return;
            }

            // Esperar elemento sumir ou aparecer
            m = line.match(/espera o elemento "([^"]+)" (sumir|aparecer)/);
            if (m) {
                const visible = m[2] === 'aparecer';
                steps.push(`- waitFor: "${m[1]}"`);
                steps.push(`  timeout: 5000`);
                steps.push(`  visible: ${visible}`);
                return;
            }

            // Esperar genérico "espera 'loading'" ou "espera por 'loading'"
            m = line.match(/espera (?:o |por )?"?([^"]+)"?/);
            if (m) {
                const el = m[1].trim();
                steps.push(`- waitFor: "${el}"`);
                steps.push(`  timeout: 5000`);
                steps.push(`  visible: true`);
                return;
            }

            // Rolar a tela
            if (line.match(/rola a tela para baixo/)) {
                steps.push(`- scrollDown`);
                return;
            }
            if (line.match(/rola a tela para cima/)) {
                steps.push(`- scrollUp`);
                return;
            }

            // Pressionar botão voltar
            if (line.match(/pressiona o botão voltar/)) {
                steps.push(`- pressBack`);
                return;
            }

            // Deslizar no elemento para alguma direção
            m = line.match(/desliza para a (direita|esquerda|cima|baixo) no elemento "([^"]+)"/);
            if (m) {
                const dirMap = { direita: 'right', esquerda: 'left', cima: 'up', baixo: 'down' };
                steps.push(`- swipe:`);
                steps.push(`    element: "${m[2]}"`);
                steps.push(`    direction: ${dirMap[m[1]]}`);
                return;
            }
        }

        if (line.startsWith('Then')) {
            const tela = line.match(/"([^"]+)"/);
            if (tela) steps.push(`- assertVisible: "${tela[1]}"`);
        }
    });

    return steps.join('\n');
}

function gerarYaml() {
    const input = document.getElementById('gherkin-input').value;
    const yaml = gherkinToMaestroYaml(input);
    document.getElementById('yaml-output').textContent = yaml;
}

document.getElementById("btnGenerate").addEventListener("click", gerarYaml)
