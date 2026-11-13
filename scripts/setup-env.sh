#!/usr/bin/env bash
# Cria o .env na raiz a partir do .env.example, preenchendo os segredos
# com valores aleatórios. Não sobrescreve um .env existente.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -e .env ]]; then
  echo ".env já existe; nada foi alterado." >&2
  exit 1
fi

cp .env.example .env
for key in POSTGRES_PASSWORD JWT_SECRET DATA_ENCRYPTION_KEY PLATFORM_SETUP_SECRET; do
  sed -i "s|^${key}=.*|${key}=$(openssl rand -hex 32)|" .env
done
chmod 600 .env
echo ".env criado com segredos aleatórios."
