# Calculadora de Calda

Aplicação web para calcular o volume de calda para pulverização.

## Funcionalidades

- Cálculo de volume total de calda (L)
- Estimativa de número de depósitos
- Cálculo de área por depósito
- Mapa interativo para desenhar o terreno e calcular hectares automaticamente
- Histórico local dos últimos 10 cálculos (guardado no browser)
- Dark mode / light mode
- Interface responsiva para telemóvel

## Como usar

1. Abra o `index.html` no browser.
2. No mapa, desenhe o terreno com a ferramenta de polígono.
3. Clique em **Usar no formulário** para preencher a área automaticamente (opcional).
4. Preencha:
   - Área a pulverizar (ha)
   - Volume por hectare (L/ha)
   - Capacidade do depósito (L)
5. Clique em **Calcular**.

O histórico é guardado em `localStorage`, por isso fica disponível no mesmo browser/dispositivo.

> Nota: o mapa usa bibliotecas por CDN (Leaflet, Leaflet Draw e Turf). É necessária ligação à internet para carregar o mapa.
