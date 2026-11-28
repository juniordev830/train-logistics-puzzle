# Engenharia reversa e estudo — Train Logistics Puzzle

## Objetivo e fluxo

Puzzle ferroviário, trajetória e histórico de ações. RailwayScene usa as regras de portas e traçado. history.ts separa desfazer e refazer da renderização, e core.py oferece uma simulação do puzzle.

**Tecnologias identificadas** · TypeScript, Python, Vite, Node.js, Phaser.

**Revisão de referência** · `5fa4da0d9240`.

## Mapa do código

| Caminho | Papel de leitura | Símbolos selecionados |
| --- | --- | --- |
| [core.py](../core.py) | Implementação | `Result`, `Puzzle`, `Puzzle._inside`, `Puzzle.reset`, `Puzzle.put`, `Puzzle.run` |
| [src/history.ts](../src/history.ts) | Implementação | `requireLimit`, `createHistory`, `pushHistory`, `undoHistory`, `redoHistory`, `canUndo`, `canRedo`, `undoSteps`, `redoSteps` |
| [src/main.ts](../src/main.ts) | Ponto de leitura para entrada ou composição | `RailwayScene`, `undoTurn`, `redoTurn`, `testRailway`, `center`, `renderScene`, `updateDetails` |
| [src/rules.ts](../src/rules.ts) | Implementação | `ports`, `rotate`, `inside`, `index`, `traceRoute` |
| [index.html](../index.html) | Marcação ou estilos da interface | — |
| [src/style.css](../src/style.css) | Marcação ou estilos da interface | — |

## Configuração e referências

Ambiente e dependências: [package.json](../package.json).

## Roteiro de estudo e desenvolvimento

1. Comece pelo fluxo descrito acima e localize seus pontos de entrada no mapa. Acompanhe uma entrada válida até a transformação ou a resposta.
2. Abra um teste relacionado ao fluxo e descreva qual regra ele protege. Compare o tratamento esperado para entradas válidas, inválidas e nos limites.
3. Ao adicionar uma regra, determine qual módulo controla o dado e cubra o caso nesse nível. Em seguida, confira o efeito no comando, na API ou na interface de entrada.

**Pergunta de entrevista**

Como detectar um ciclo na grade e evitar que a prévia de rota fique presa?

## Testes versionados

Arquivos para começar a leitura dos cenários de teste: [tests/history.test.mjs](../tests/history.test.mjs), [tests/rules.test.mjs](../tests/rules.test.mjs), [tests/test_core.py](../tests/test_core.py).

Os comandos e versões de runtime usados no CI ficam em [.github/workflows/ci.yml](../.github/workflows/ci.yml), [.github/workflows/phaser-puzzle.yml](../.github/workflows/phaser-puzzle.yml).

[Voltar ao README](../README.md).
