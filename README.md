# Train Logistics Puzzle

**Status:** MVP 2D de puzzle ferroviário em navegador com Phaser 3 e TypeScript.

## Como jogar
- Clique/toque nos segmentos de trilho para girar retas e curvas.
- Conecte a estação **verde** (esquerda) à estação **dourada** (direita).
- Clique em **Testar rota** ou pressione Enter para enviar o trem.
- Se houver conexões quebradas, ajuste os trilhos e tente de novo.
- Pressione **R** para recomeçar.

## Iniciar

Requer Node.js 20.19+:

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite.

## Testes

```bash
npm test
npm run build
```

As regras puras em `src/rules.ts` validam conexões, detecção de ciclos, fronteiras e rota completa. `src/main.ts` contém o painel e as interações do jogo.

## Escopo e limites

O protótipo possui um nível, trajetórias determinísticas, desenho geométrico e trem animado. Não há sistema de pontuação online, locomotivas 3D, logística real nem salvamento de progresso. O jogo é inteiramente demonstrativo.

## Evolução

Níveis gerados, obstáculos, planejamento de tempo, novas locomotivas e suporte avançado a acessibilidade.


## Desfazer e refazer edições (novo)

- **Z** desfaz a última rotação de trilho.
- **Y** refaz a rotação desfeita.
- Se você desfizer e girar outro trilho, o histórico de refazer é descartado para evitar estados incompatíveis.
- As 100 últimas rotações ficam disponíveis para desfazer, sem armazenar histórico indefinidamente.
- Enquanto o trem estiver em movimento ou após a entrega, os comandos não alteram o tabuleiro. Reinicie com **R** para uma nova tentativa.

O histórico imutável fica em `src/history.ts`, com testes unitários em `tests/history.test.mjs`. O contador de movimentos continua representando o total de rotações feitas na partida, inclusive aquelas posteriormente desfeitas.
