# Train Logistics Puzzle

Jogo de raciocínio ferroviário **em concepção**, sobre planejamento de trilhos e chegada de trens a destinos.

> **Estado atual:** ainda não há código, biblioteca de mapas, interface ou testes. Este documento especifica a primeira versão a desenvolver.

## Primeiro puzzle

Mapa de grade com uma estação de origem, um destino e peças de trilho colocadas pelo jogador. Um trem deve seguir a rota válida sem entrar em trecho sem saída.

## Regras a implementar

- Cada peça expõe conexões de entrada e saída definidas.
- A continuidade da rota depende de bordas conectadas entre células adjacentes.
- A origem e o destino devem ser identificáveis e únicos no nível.
- O jogador não pode sobrepor peças incompatíveis.
- O simulador interrompe a execução ao atingir destino, colisão ou trilho ausente.

## Critérios de aceitação

1. Mapa simples com linha contínua permite chegada ao destino.
2. Se faltar uma peça no meio, o trem para e mostra motivo.
3. Curva incompatível não é considerada conexão válida.
4. Dois níveis com a mesma entrada produzem o mesmo resultado.
5. Reiniciar o puzzle repõe peças e posição inicial.

## Plano de código

- [ ] Modelo independente de grade, células e conectores.
- [ ] Testes de validação de caminhos e estados finais.
- [ ] Simulação passo a passo sem renderização.
- [ ] Interface 2D com edição visual dos trilhos.
- [ ] Persistência de níveis e instruções de execução.

O MVP é um jogo de puzzle, não um simulador de operação ferroviária real.

## Primeiro incremento de código (em revisão)

Grade ferroviária e simulação passo a passo de trilhos compatíveis, lacunas, curvas e chegada.

O arquivo `core.py` contém a implementação executável em Python 3.11+ e `tests/test_core.py` cobre regras, entradas inválidas e repetibilidade. Não há engine 3D, UI gráfica, asset ou build final nesta entrega; o protótipo é de **domínio/testes**.

Para executar a demonstração:

```bash
python core.py
```

Para verificar o comportamento:

```bash
python -m unittest discover -s tests -p 'test_*.py' -v
```

O GitHub Actions executa a suíte em cada PR. A lista de tarefas do roteiro acima descreve o objetivo completo do jogo e não deve ser interpretada como pronto para publicação.
