# Avaliacao de Fontes de Cotacoes

Data da avaliacao: 14 de junho de 2026.

## Decisao

Manter a cotacao manual em `assets.current_price` nesta fase. Nao expor chave de API
no frontend estatico. Reavaliar a automacao quando existir um backend gratuito seguro
ou uma fonte publica sem segredo e com termos adequados.

## Provedores avaliados

- brapi.dev: melhor cobertura para o produto brasileiro, incluindo acoes, FIIs, ETFs,
  BDRs, criptomoedas e cambio. A documentacao orienta explicitamente usar token no
  backend e nunca expo-lo no frontend. O acesso amplo em producao depende de plano.
- Alpha Vantage: cobre acoes globais, cambio e cripto, mas a chave gratuita permite
  ate 25 requisicoes por dia e dados em tempo real relevantes podem ser premium.
- CoinGecko: adequado somente ao recorte de cripto. O plano demo usa chave e possui
  limite aproximado de 30 chamadas por minuto, variavel conforme o trafego.

## Fontes oficiais

- https://brapi.dev/docs
- https://brapi.dev/pricing
- https://www.alphavantage.co/documentation/
- https://www.alphavantage.co/support/#api-key
- https://docs.coingecko.com/docs/common-errors-rate-limit
