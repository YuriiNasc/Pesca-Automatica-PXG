const screenshot = require('screenshot-desktop');
const Jimp = require('jimp');
const readline = require('readline-sync');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Função para focar na janela do jogo
function focusWindow(title) {
    try {
        const command = `powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate('${title}')"`;
        execSync(command);
    } catch (err) {
        // Silencioso se não conseguir focar
    }
}

// Função para simular pressionamento de tecla via PowerShell
function keyTap(key) {
    try {
        const title = "PokeXGames";
        // Script PowerShell que carrega o assembly, foca na janela e envia a tecla
        const psScript = `Add-Type -AssemblyName System.Windows.Forms; $wshell = New-Object -ComObject WScript.Shell; if ($wshell.AppActivate('${title}')) { Start-Sleep -m 150; [System.Windows.Forms.SendKeys]::SendWait('${key}') }`;
        const command = `powershell -Command "${psScript}"`;
        execSync(command);
    } catch (err) {
        console.error(`Erro ao pressionar tecla ${key}:`, err.message);
    }
}

// Função para verificar se o jogo está aberto (pelo título da janela ou processo)
function isGameOpen(title) {
    try {
        const command = `powershell -Command "Get-Process | Where-Object { $_.MainWindowTitle -eq '${title}' }"`;
        const stdout = execSync(command).toString();
        return stdout.length > 0;
    } catch (err) {
        return false;
    }
}

// Função para executar magias (teclas 8 a 1)
async function executeSpells() {
    console.log("Executando magias (teclas 8-1)...");
    const spells = ['8', '7', '6', '5', '4', '3', '2', '1'];
    for (const spell of spells) {
        keyTap(spell);
        await new Promise(r => setTimeout(r, 200)); // Pequeno intervalo entre magias
    }
}

// Caminhos das imagens
const bolhasImgPath = path.join(__dirname, 'bolhas.png');
const varaImgPath = path.join(__dirname, 'vara.png');

// Configurações
const CONFIDENCE = 0.75;
const CHECK_INTERVAL = 1000; // 1 segundo

async function findImageOnScreen(templatePath) {
    try {
        if (!fs.existsSync(templatePath)) {
            console.error(`Erro: Arquivo ${templatePath} não encontrado.`);
            return null;
        }

        const screen = await screenshot();
        const screenImage = await Jimp.read(screen);
        const templateImage = await Jimp.read(templatePath);

        const screenWidth = screenImage.bitmap.width;
        const screenHeight = screenImage.bitmap.height;
        const templateWidth = templateImage.bitmap.width;
        const templateHeight = templateImage.bitmap.height;

        // Implementação simplificada de busca de template (pixel a pixel)
        // Percorre a tela em saltos para economizar CPU
        const step = 2;

        for (let y = 0; y < screenHeight - templateHeight; y += step) {
            for (let x = 0; x < screenWidth - templateWidth; x += step) {
                let match = true;

                // Verifica 4 cantos e o centro como "check rápido"
                const checks = [
                    [0, 0], [templateWidth - 1, 0],
                    [0, templateHeight - 1], [templateWidth - 1, templateHeight - 1],
                    [Math.floor(templateWidth / 2), Math.floor(templateHeight / 2)]
                ];

                for (const [tx, ty] of checks) {
                    const screenColor = screenImage.getPixelColor(x + tx, y + ty);
                    const templateColor = templateImage.getPixelColor(tx, ty);

                    const diff = Jimp.colorDiff(Jimp.intToRGBA(screenColor), Jimp.intToRGBA(templateColor));
                    if (diff > (1 - CONFIDENCE)) {
                        match = false;
                        break;
                    }
                }

                if (match) {
                    console.log(`Imagem encontrada em: ${x}, ${y}`);
                    return { x, y };
                }
            }
        }

        return null;
    } catch (err) {
        console.error("Erro ao processar imagem:", err);
        return null;
    }
}

async function startBot() {
    console.log("Bot iniciado. Certifique-se de que a janela do jogo está visível.");
    console.log("Pressione Ctrl+C para parar.");

    while (true) {
        console.log("Jogando a vara (tecla Shift+Z)...");
        // Simula casting da vara (Shift+Z = +z)
        keyTap("+z");
        await new Promise(r => setTimeout(r, 2000)); // Espera a vara cair na água

        let bubblesFound = false;
        let startTime = Date.now();
        const MAX_WAIT = 30000; // Espera no máximo 30 segundos pelas bolhas

        while (Date.now() - startTime < MAX_WAIT) {
            const bubbles = await findImageOnScreen(bolhasImgPath);
            if (bubbles) {
                console.log("Bolhas detectadas! Puxando a vara...");
                keyTap("+z"); // Puxa a vara
                bubblesFound = true;
                break;
            }
            await new Promise(r => setTimeout(r, 500)); // Intervalo de busca
        }

        if (bubblesFound) {
            await new Promise(r => setTimeout(r, 1000)); // Espera o pokemon aparecer
            await executeSpells();
        } else {
            console.log("Tempo esgotado. Tentando novamente...");
        }

        const idleDelay = 2000 + Math.random() * 2000; // Delay aleatório para parecer humano
        await new Promise(r => setTimeout(r, idleDelay));
    }
}

function main() {
    console.log("Verificando se o jogo (PokeXGames) está aberto...");
    if (!isGameOpen('PokeXGames')) {
        console.warn("AVISO: A janela 'PokeXGames' não foi detectada.");
        console.warn("Certifique-se de que o jogo está aberto e visível.");
        const continuar = readline.question("Deseja continuar mesmo assim? (S/N): ");
        if (continuar.toUpperCase() !== 'S') {
            process.exit();
        }
    }

    const resposta = readline.question("Deseja iniciar o macro de pesca? (S/N): ");

    if (resposta.toUpperCase() === 'S') {
        startBot();
    } else {
        console.log("Macro não iniciado.");
        process.exit();
    }
}

main();
