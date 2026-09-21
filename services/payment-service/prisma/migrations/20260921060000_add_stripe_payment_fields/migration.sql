ALTER TABLE "Payment" ADD COLUMN "paymentIntentId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "stripeEventId" TEXT;

CREATE UNIQUE INDEX "Payment_paymentIntentId_key" ON "Payment"("paymentIntentId");
CREATE UNIQUE INDEX "Payment_stripeEventId_key" ON "Payment"("stripeEventId");
