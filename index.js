const screenshot = require('screenshot-desktop');
const Jimp = require('jimp');
const readline = require('readline-sync');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Função para simular pressionamento de tecla via PowerShell (sem robotojs)
function keyTap(key) {
    try {
        // Envolve a tecla em chaves para o SendKeys se necessário, 
        // ou envia diretamente se for um número/letra simples.
        const command = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${key}')"`;
        execSync(command);
    } catch (err) {
        console.error(`Erro ao pressionar tecla ${key}:`, err.message);
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
        console.log("Jogando a vara (tecla CTRL+Z)...");
        // Simula casting da vara (ajuste o atalho se necessário)
        keyTap("^z");
        await new Promise(r => setTimeout(r, 2000)); // Espera a vara cair na água

        let bubblesFound = false;
        let startTime = Date.now();
        const MAX_WAIT = 30000; // Espera no máximo 30 segundos pelas bolhas

        while (Date.now() - startTime < MAX_WAIT) {
            const bubbles = await findImageOnScreen(bolhasImgPath);
            if (bubbles) {
                console.log("Bolhas detectadas! Puxando a vara...");
                keyTap("^z"); // Puxa a vara
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
    const resposta = readline.question("Deseja iniciar o macro de pesca? (S/N): ");

    if (resposta.toUpperCase() === 'S') {
        startBot();
    } else {
        console.log("Macro não iniciado.");
        process.exit();
    }
}

main();
