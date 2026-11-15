# Train Logistics Puzzle

## Jogo de navegador em Phaser

**Status:** MVP 2D de puzzle ferroviário em navegador com Phaser 3 e TypeScript.

### Como jogar
- Clique/toque nos segmentos de trilho para girar retas e curvas.
- Conecte a estação **verde** (esquerda) à estação **dourada** (direita).
- Clique em **Testar rota** ou pressione Enter para enviar o trem.
- Se houver conexões quebradas, ajuste os trilhos e tente de novo.
- Pressione **R** para recomeçar.

### Iniciar

Requer Node.js 20.19+:

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite.

### Testes

```bash
npm test
npm run build
```

As regras puras em `src/rules.ts` validam conexões, detecção de ciclos, fronteiras e rota completa. `src/main.ts` contém o painel e as interações do jogo.

### Escopo e limites

O protótipo possui um nível, trajetórias determinísticas, desenho geométrico e trem animado. Não há sistema de pontuação online, locomotivas 3D, logística real nem salvamento de progresso. O jogo é inteiramente demonstrativo.

### Evolução

Níveis gerados, obstáculos, planejamento de tempo, novas locomotivas e suporte avançado a acessibilidade.


### Desfazer e refazer edições (novo)

- **Z** desfaz a última rotação de trilho.
- **Y** refaz a rotação desfeita.
- Se você desfizer e girar outro trilho, o histórico de refazer é descartado para evitar estados incompatíveis.
- As 100 últimas rotações ficam disponíveis para desfazer, sem armazenar histórico indefinidamente.
- Enquanto o trem estiver em movimento ou após a entrega, os comandos não alteram o tabuleiro. Reinicie com **R** para uma nova tentativa.

O histórico imutável fica em `src/history.ts`, com testes unitários em `tests/history.test.mjs`. O contador de movimentos continua representando o total de rotações feitas na partida, inclusive aquelas posteriormente desfeitas.

### Desfazer e refazer em blocos

Além de **Z** e **Y** (uma jogada), use **Shift+Z** para desfazer até **5 jogadas** e **Shift+Y** para refazer até **5 jogadas**. A operação para automaticamente no começo ou fim do histórico, sem modificar snapshots anteriores nem permitir contagens inválidas. Os atalhos ficam desativados durante a animação do trem ou depois da vitória.

## Núcleo Python e planejamento

### Primeiro puzzle

Mapa de grade com uma estação de origem, um destino e peças de trilho colocadas pelo jogador. Um trem deve seguir a rota válida sem entrar em trecho sem saída.

### Regras a implementar

- Cada peça expõe conexões de entrada e saída definidas.
- A continuidade da rota depende de bordas conectadas entre células adjacentes.
- A origem e o destino devem ser identificáveis e únicos no nível.
- O jogador não pode sobrepor peças incompatíveis.
- O simulador interrompe a execução ao atingir destino, colisão ou trilho ausente.

### Critérios de aceitação

1. Mapa simples com linha contínua permite chegada ao destino.
2. Se faltar uma peça no meio, o trem para e mostra motivo.
3. Curva incompatível não é considerada conexão válida.
4. Dois níveis com a mesma entrada produzem o mesmo resultado.
5. Reiniciar o puzzle repõe peças e posição inicial.

### Plano de código

- [ ] Modelo independente de grade, células e conectores.
- [ ] Testes de validação de caminhos e estados finais.
- [ ] Simulação passo a passo sem renderização.
- [ ] Interface 2D com edição visual dos trilhos.
- [ ] Persistência de níveis e instruções de execução.

O MVP é um jogo de puzzle, não um simulador de operação ferroviária real.

### Testes do núcleo Python

Grade ferroviária e simulação passo a passo de trilhos compatíveis, lacunas, curvas e chegada.

O arquivo `core.py` contém a implementação executável em Python 3.11+ e `tests/test_core.py` cobre regras, entradas inválidas e repetibilidade. O núcleo Python roda de forma independente da versão visual.

Para executar a demonstração:

```bash
python core.py
```

Para verificar o comportamento:

```bash
python -m unittest discover -s tests -p 'test_*.py' -v
```

O GitHub Actions executa a suíte em cada PR. A lista de tarefas do roteiro acima descreve o objetivo completo do jogo e não deve ser interpretada como pronto para publicação.
