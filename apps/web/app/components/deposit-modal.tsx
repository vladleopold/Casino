"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useSlotcityAccount } from "./account-context";

const amountPresets = [500, 1000, 2000, 5000, 10000];

const paymentMethods = [
  {
    id: "card",
    provider: "visa-mastercard",
    title: "Банківська картка",
    note: "Visa / Mastercard"
  },
  {
    id: "apple-google-pay",
    provider: "apple-google-pay",
    title: "Apple Pay / Google Pay",
    note: "Швидкий підтверджений платіж"
  },
  {
    id: "bank-transfer",
    provider: "bank-transfer",
    title: "Bank transfer",
    note: "Ручна перевірка оператором"
  }
];

export function DepositModal() {
  const { account, closeDepositModal, isDepositModalOpen, submitDepositRequest } =
    useSlotcityAccount();
  const [amount, setAmount] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  const [paymentProvider, setPaymentProvider] = useState(paymentMethods[0].provider);
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdDepositId, setCreatedDepositId] = useState<string | null>(null);

  useEffect(() => {
    if (!isDepositModalOpen) {
      setError(null);
      setIsSubmitting(false);
      setCreatedDepositId(null);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDepositModalOpen]);

  const payerEmail = account?.email ?? "";
  const selectedMethod = useMemo(() => {
    return paymentMethods.find((method) => method.id === paymentMethod) ?? paymentMethods[0];
  }, [paymentMethod]);

  if (!isDepositModalOpen || !account) {
    return null;
  }

  const handleSubmit = async () => {
    setError(null);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Вкажіть коректну суму поповнення.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitDepositRequest({
        amount: Math.round(amount),
        paymentMethod,
        paymentProvider,
        payerName,
        payerEmail,
        payerPhone,
        notes
      });

      if (!result.ok) {
        setError(result.message ?? "Не вдалося створити заявку на поповнення.");
        return;
      }

      setCreatedDepositId(result.depositId ?? null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="slotcity-deposit-modal-layer" role="dialog" aria-modal="true" aria-labelledby="deposit-title">
      <button
        type="button"
        className="slotcity-deposit-modal-backdrop"
        aria-label="Закрити поповнення"
        onClick={closeDepositModal}
      />

      <div className="slotcity-deposit-modal-card">
        <div className="slotcity-deposit-modal-header">
          <div>
            <span className="slotcity-section-kicker">Поповнення балансу</span>
            <h2 id="deposit-title">Захищений депозит у SlotCity</h2>
            <p>
              Баланс зараховується тільки після серверного підтвердження заявки. Будь-яке
              нарахування проходить через ledger, а не через клієнтський код.
            </p>
          </div>
          <button
            type="button"
            className="slotcity-icon-button slotcity-deposit-modal-close"
            aria-label="Закрити"
            onClick={closeDepositModal}
          >
            <span>✕</span>
          </button>
        </div>

        {createdDepositId ? (
          <div className="slotcity-deposit-modal-success">
            <span className="slotcity-section-kicker">Заявку створено</span>
            <h3>Поповнення відправлено на перевірку</h3>
            <p>
              ID заявки: <strong>{createdDepositId}</strong>
            </p>
            <p>
              Після підтвердження оператором сума з’явиться на балансі, а запис потрапить у
              журнал транзакцій і в mirror користувача.
            </p>
            <div className="slotcity-deposit-modal-actions">
              <Link href="/my-city" className="slotcity-cta slotcity-cta-primary" onClick={closeDepositModal}>
                Перейти в Моє сіті
              </Link>
              <button
                type="button"
                className="slotcity-cta slotcity-cta-secondary"
                onClick={closeDepositModal}
              >
                Закрити
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="slotcity-deposit-grid">
              <section className="slotcity-deposit-panel">
                <span className="slotcity-section-kicker">Сума</span>
                <div className="slotcity-deposit-presets">
                  {amountPresets.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`slotcity-deposit-preset${amount === value ? " is-active" : ""}`}
                      onClick={() => setAmount(value)}
                    >
                      {value.toLocaleString("uk-UA")} ₴
                    </button>
                  ))}
                </div>

                <label className="slotcity-registration-field">
                  <span>Сума поповнення</span>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={amount}
                    onChange={(event) => setAmount(Number(event.target.value))}
                  />
                </label>
              </section>

              <section className="slotcity-deposit-panel">
                <span className="slotcity-section-kicker">Метод оплати</span>
                <div className="slotcity-deposit-methods">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      className={`slotcity-deposit-method${paymentMethod === method.id ? " is-active" : ""}`}
                      onClick={() => {
                        setPaymentMethod(method.id);
                        setPaymentProvider(method.provider);
                      }}
                    >
                      <strong>{method.title}</strong>
                      <span>{method.note}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="slotcity-deposit-grid">
              <section className="slotcity-deposit-panel">
                <span className="slotcity-section-kicker">Платник</span>
                <label className="slotcity-registration-field">
                  <span>Ім’я платника</span>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(event) => setPayerName(event.target.value)}
                    placeholder="Владислав"
                  />
                </label>
                <label className="slotcity-registration-field">
                  <span>Email</span>
                  <input type="email" value={payerEmail} disabled />
                </label>
                <label className="slotcity-registration-field">
                  <span>Телефон</span>
                  <input
                    type="tel"
                    value={payerPhone}
                    onChange={(event) => setPayerPhone(event.target.value)}
                    placeholder="+380..."
                  />
                </label>
              </section>

              <section className="slotcity-deposit-panel">
                <span className="slotcity-section-kicker">Підсумок</span>
                <div className="slotcity-deposit-summary">
                  <div>
                    <span>Поточний баланс</span>
                    <strong>{account.balance.toLocaleString("uk-UA")} ₴</strong>
                  </div>
                  <div>
                    <span>Метод</span>
                    <strong>{selectedMethod.title}</strong>
                  </div>
                  <div>
                    <span>Провайдер</span>
                    <strong>{paymentProvider}</strong>
                  </div>
                  <div>
                    <span>До зарахування після approve</span>
                    <strong>{amount.toLocaleString("uk-UA")} ₴</strong>
                  </div>
                </div>

                <label className="slotcity-registration-field">
                  <span>Коментар до заявки</span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Наприклад: поповнення для live-ігор"
                    rows={4}
                  />
                </label>
              </section>
            </div>

            {error ? <div className="slotcity-registration-error">{error}</div> : null}

            <div className="slotcity-deposit-modal-actions">
              <button
                type="button"
                className="slotcity-cta slotcity-cta-secondary"
                onClick={closeDepositModal}
                disabled={isSubmitting}
              >
                Скасувати
              </button>
              <button
                type="button"
                className="slotcity-cta slotcity-cta-primary"
                onClick={() => {
                  void handleSubmit();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Створюємо заявку..." : "Підтвердити поповнення"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
