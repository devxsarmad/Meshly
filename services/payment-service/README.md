# Payment service

Payment-service owns one-time payments and Meshly Club billing because both workflows share Stripe credentials, webhook signature verification, payment persistence, and payment-domain events. Keeping them in one bounded context reduces duplicated Stripe integration code while the subscription models remain separate from product-order payments. A separate subscription-service would provide stronger independent scaling and ownership later, at the cost of another service, database boundary, and event/API coordination.

Run the idempotent Club plan seed locally with `npm run seed` after setting `DATABASE_URL` and `STRIPE_SECRET_KEY`. It creates or reuses the monthly and yearly Stripe test Prices and stores their IDs in PostgreSQL.
