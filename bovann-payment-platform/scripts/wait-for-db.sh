#!/bin/sh
# scripts/wait-for-db.sh

echo " Attente de MongoDB..."

until npx prisma db pull --skip-generate > /dev/null 2>&1; do
  echo "MongoDB non prêt, réessai dans 2s..."
  sleep 2
done

echo " MongoDB prêt. Génération du client Prisma..."
npx prisma generate

echo " Démarrage de l'application..."
exec "$@"