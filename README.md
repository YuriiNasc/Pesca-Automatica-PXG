# Pesca Automática (PXG Macro Bot) 🎣

Este é um macro bot desenvolvido em Node.js especificamente para o **PXG**, utilizando detecção de tela e simulação de teclas via PowerShell para máxima compatibilidade no Windows.

## 🚀 Funcionalidades

- **Detecção de Tela**: Utiliza a biblioteca `screenshot-desktop` para capturar a tela em tempo real.
- **Simulação de Teclas**: Utiliza comandos nativos do PowerShell para simular o pressionamento de teclas (8 a 1), evitando problemas de compilação com bibliotecas nativas como `robotjs`.
- **Interface Simples**: Execução via CMD com script de confirmação.

## 🛠️ Pré-requisitos

- [Node.js](https://nodejs.org/) (recomendado v18+)

## 📥 Instalação

1. Clone o repositório ou baixe os arquivos.
2. Abra o terminal na pasta do projeto e instale as dependências:
   ```bash
   npm install
   ```

## 🎮 Como Usar

1. Certifique-se de que as imagens `bolhas.png` e `vara.png` estão na raiz do projeto (elas são usadas como base para a detecção de estados no jogo).
2. Execute o macro clicando duas vezes no arquivo `PESCA.bat` ou via terminal:
   ```bash
   node index.js
   ```
3. Digite `S` quando solicitado para iniciar o bot.

## ⚙️ Configurações

No arquivo `index.js`, você pode ajustar:
- `CONFIDENCE`: O nível de precisão na busca de imagens (0.0 a 1.0).
- `CHECK_INTERVAL`: O intervalo de tempo (em milissegundos) entre as verificações da tela.

---
**IMPORTANTE**: Este macro foi desenvolvido especificamente para o **PXG**. O uso indevido pode estar sujeito às regras do jogo. Este script foi desenhado exclusivamente para ambiente Windows.
