"use client";

import type { Route } from "next";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useSlotcityAccount } from "./account-context";

function resolveNextHref(searchParams: URLSearchParams) {
  const explicitNext = searchParams.get("next");

  if (explicitNext) {
    return explicitNext;
  }

  const gameSlug = searchParams.get("game");

  if (gameSlug) {
    return `/game/${gameSlug}`;
  }

  return "/catalog";
}

export function RegistrationAuthPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "login" ? "login" : "register";
  const { account, hasGoogleAuth, isAuthenticated, login, loginWithGoogle, register } =
    useSlotcityAccount();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (mode === "register" && password !== passwordConfirm) {
      setError("Паролі не співпадають.");
      return;
    }

    setIsSubmitting(true);

    const result =
      mode === "login"
        ? await login({
            email,
            password
          })
        : await register({
            email,
            username,
            password
          });

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message ?? "Не вдалося завершити дію.");
      return;
    }

    router.push(resolveNextHref(searchParams) as Route);
  };

  return (
    <aside className="slotcity-registration-auth-card">
      <span className="slotcity-section-kicker">
        {mode === "login" ? "Увійти в SlotCity" : "Створити акаунт SlotCity"}
      </span>
      <h3>{mode === "login" ? "Швидкий вхід" : "Реєстрація з PostgreSQL"}</h3>
      <p>
        {mode === "login"
          ? "Використайте email і пароль. Після входу дії прив'язуються вже до реального користувача."
          : "Користувач створюється в PostgreSQL storefront-auth storage. Після цього його можна бачити в операторському розділі та в Directus mirror."}
      </p>

      <label className="slotcity-registration-field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="player@slotcity.test"
        />
      </label>

      {mode === "register" ? (
        <label className="slotcity-registration-field">
          <span>Нікнейм</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="slotcity_player"
          />
        </label>
      ) : null}

      <label className="slotcity-registration-field">
        <span>Пароль</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Мінімум 8 символів"
        />
      </label>

      {mode === "register" ? (
        <label className="slotcity-registration-field">
          <span>Підтвердити пароль</span>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            placeholder="Повторіть пароль"
          />
        </label>
      ) : null}

      {error ? <div className="slotcity-registration-error">{error}</div> : null}

      <button
        type="button"
        className="slotcity-auth-button slotcity-auth-button-primary"
        onClick={() => {
          void handleSubmit();
        }}
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Обробка..."
          : mode === "login"
            ? "Увійти і продовжити"
            : "Створити акаунт"}
      </button>

      {hasGoogleAuth ? (
        <button
          type="button"
          className="slotcity-auth-button slotcity-auth-button-secondary"
          onClick={() => {
            void loginWithGoogle(resolveNextHref(searchParams));
          }}
          disabled={isSubmitting}
        >
          Увійти через Google
        </button>
      ) : null}

      <div className="slotcity-registration-panel-meta">
        <span>Оператори: `/operator/activity` і `/operator/users`</span>
        {account && isAuthenticated ? <span>Поточний userId: {account.userId}</span> : null}
      </div>
    </aside>
  );
}
