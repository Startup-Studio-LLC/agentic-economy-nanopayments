# Slide Deck Outline

## Slide 1: Problem

- AI tools and APIs are still sold with subscriptions and bundles
- That breaks down for infrequent, high-value, or machine-to-machine actions
- Tiny transactions often lose their economics when payment overhead is too high

## Slide 2: Product

- ToolMarket Lite
- Premium tools sold one call at a time
- Featured example: structured web extraction
- Buyer pays only when the tool runs

## Slide 3: Payment Flow

- Request triggers HTTP 402-style payment requirement
- Buyer authorizes payment
- Request retries and fulfills immediately
- Seller revenue and payment log update in the UI

## Slide 4: Why Arc and Circle

- Arc supports a clean USDC-denominated story for small payments
- Circle Gateway batching enables low-friction settlement
- x402-style flows make the payment handshake explicit and machine-readable

## Slide 5: Business Value

- Better than subscriptions for sparse usage
- Better than prepaid credits for variable-value actions
- Better for solo sellers and small APIs entering the agent economy

## Slide 6: Proof and Next Steps

- Seller dashboard
- Settlement evidence
- 50-plus transaction proof runner
- Future expansion into more premium tools and real seller publishing
