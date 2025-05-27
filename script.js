function gherkinToMaestroYaml(gherkinText) {
    const lines = gherkinText.split('\n').map(line => line.trim());
    const steps = [];
    const naoReconhecidas = [];

    steps.push('appId: com.example.app');
    steps.push('---');

    lines.forEach((line, index) => {
        let reconhecido = false;

        if (line.startsWith('Given')) {
            // Aceita qualquer texto depois de Given que contenha "algo"
            const tela = line.match(/^Given.*"([^"]+)"$/);
            if (tela) {
                steps.push(`- assertVisible: "${tela[1]}"`);
                reconhecido = true;
            } else if (line === 'Given') {
                steps.push(`- launchApp`);
                reconhecido = true;
            }
            // outras formas de Given não reconhecidas
        }
        else if (line.startsWith('When') || line.startsWith('And')) {
            // Os casos reconhecidos para When/And

            if (/^When espera( um momento)?$/i.test(line) || /^And espera( um momento)?$/i.test(line)) {
                steps.push(`- sleep: 5000`);
                reconhecido = true;
            } else {
                let m;

                m = line.match(/^(When|And) espera (\d+) segundos?$/i);
                if (m) {
                    const ms = parseInt(m[2], 10) * 1000;
                    steps.push(`- sleep: ${ms}`);
                    reconhecido = true;
                }

                m = line.match(/^(When|And) preenche o campo "([^"]+)" com "([^"]+)"$/);
                if (m) {
                    steps.push(`- tapOn: "${m[2]}"`);
                    steps.push(`- inputText: "${m[3]}"`);
                    reconhecido = true;
                }

                m = line.match(/^(When|And) clica no botão "([^"]+)"$/);
                if (m) {
                    steps.push(`- tapOn: "${m[2]}"`);
                    reconhecido = true;
                }

                m = line.match(/^(When|And) espera o elemento "([^"]+)" (sumir|aparecer)$/);
                if (m) {
                    const visible = m[3] === 'aparecer';
                    steps.push(`- waitFor: "${m[2]}"`);
                    steps.push(`  timeout: 5000`);
                    steps.push(`  visible: ${visible}`);
                    reconhecido = true;
                }

                m = line.match(/^(When|And) espera (?:o |por )?"?([^"]+)"?$/);
                if (m) {
                    const el = m[2].trim();
                    steps.push(`- waitFor: "${el}"`);
                    steps.push(`  timeout: 5000`);
                    steps.push(`  visible: true`);
                    reconhecido = true;
                }

                if (/^(When|And) rola a tela para baixo$/i.test(line)) {
                    steps.push(`- scrollDown`);
                    reconhecido = true;
                }
                if (/^(When|And) rola a tela para cima$/i.test(line)) {
                    steps.push(`- scrollUp`);
                    reconhecido = true;
                }
                if (/^(When|And) pressiona o botão voltar$/i.test(line)) {
                    steps.push(`- pressBack`);
                    reconhecido = true;
                }

                m = line.match(/^(When|And) desliza para a (direita|esquerda|cima|baixo) no elemento "([^"]+)"$/);
                if (m) {
                    const dirMap = { direita: 'right', esquerda: 'left', cima: 'up', baixo: 'down' };
                    steps.push(`- swipe:`);
                    steps.push(`    element: "${m[3]}"`);
                    steps.push(`    direction: ${dirMap[m[2]]}`);
                    reconhecido = true;
                }
            }
        }
        else if (line.startsWith('Then')) {
            // Aceita qualquer texto depois de Then que contenha "algo"
            const tela = line.match(/^Then.*"([^"]+)"$/);
            if (tela) {
                steps.push(`- assertVisible: "${tela[1]}"`);
                reconhecido = true;
            }
        }

        // Ignorar linhas vazias
        if (!reconhecido && line !== '') {
            naoReconhecidas.push(`Linha ${index + 1}: ${line}`);
        }
    });

    return { yaml: steps.join('\n'), naoReconhecidas };
}

function gerarYaml() {
    const input = document.getElementById('gherkin-input').value;
    const { yaml, naoReconhecidas } = gherkinToMaestroYaml(input);
    document.getElementById('yaml-output').textContent = yaml;

    const erroDiv = document.getElementById('nao-reconhecidas');
    erroDiv.innerHTML = '';

    if (naoReconhecidas.length > 0) {
        const titulo = document.createElement('h3');
        titulo.textContent = 'Linhas não reconhecidas:';
        erroDiv.appendChild(titulo);

        const lista = document.createElement('ul');
        naoReconhecidas.forEach(linha => {
            const li = document.createElement('li');
            li.textContent = linha;
            lista.appendChild(li);
        });
        erroDiv.appendChild(lista);
        erroDiv.style.display = 'block';
    } else {
        erroDiv.style.display = 'none';
    }
}

document.getElementById("btnGenerate").addEventListener("click", gerarYaml);
