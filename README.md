Voici un fichier README.md complet avec toutes les commandes organisées :

# Gestion Scolaire Bovann - Frontend

##  Prérequis

- Docker et Docker Compose installés
- Node.js (pour le développement local)

##  Démarrage Rapide

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd bovann-frontend
```

### 2. Construction et Lancement avec Docker
```bash
# Build et démarrage en mode détaché
docker compose up --build -d
```

L'application sera accessible sur : **http://localhost:8081**

##  Commandes Docker Utiles

### Gestion des conteneurs
```bash
# Démarrer les services
docker compose up -d

# Arrêter les services
docker compose down

# Voir les logs
docker compose logs -f

# Redémarrer les services
docker compose restart

# Rebuild et redémarrer
docker compose up --build -d
```

### Commandes de développement
```bash
# Build l'image Docker
docker build -t bovann-frontend .

# Lancer un conteneur sur un port spécifique
docker run -p 8081:80 bovann-frontend

# Nettoyer les conteneurs et images
docker system prune -f
```

##  Structure du Projet

```
bovann-frontend/
├── Dockerfile              # Configuration Docker
├── docker-compose.yml      # Orchestration Docker
├── nginx.conf             # Configuration Nginx
├── public/                # Fichiers statiques
├── src/                   # Code source React/TypeScript
├── package.json           # Dépendances et scripts
└── README.md             # Documentation
```

##  Configuration

### Ports
- **Frontend** : 8081 (modifiable dans `docker-compose.yml`)
- Le conteneur interne utilise le port 80 (Nginx)

### Variables d'Environnement
Les variables peuvent être configurées dans :
- Fichier `.env` (développement)
- `docker-compose.yml` (production)

##  Développement Local (sans Docker)

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm start

# Build pour la production
npm run build

# Lancer les tests
npm test
```

##  Dépannage

### Problèmes de ports
Si le port 8081 est déjà utilisé, modifiez `docker-compose.yml` :
```yaml
ports:
  - "8082:80"  # Changer le port
```

### Vérification du statut
```bash
# Vérifier les conteneurs en cours
docker ps

# Inspecter un conteneur
docker inspect bovann-frontend

# Voir l'utilisation des ressources
docker stats
```

### Logs et Debug
```bash
# Voir tous les logs
docker compose logs

# Suivre les logs en temps réel
docker compose logs -f

# Logs spécifiques au frontend
docker compose logs frontend
```

##  Scripts Disponibles

### Scripts Docker
```bash
npm run build:docker        # Build l'image Docker
npm run start:docker        # Lance le conteneur sur 8081
npm run compose:up         # Lance avec Docker Compose
npm run compose:down       # Arrête les services
```

### Scripts de Développement
```bash
npm start                  # Dev server sur 3000
npm run build             # Build production
npm test                  # Lance les tests
npm run eject             # Éjecte la config (irréversible)
```

##  Intégration avec le Backend

Le frontend est conçu pour fonctionner avec le backend Bovann. Assurez-vous que :

1. Le backend est accessible (généralement sur `http://localhost:8080`)
2. Les variables d'environnement sont correctement configurées
3. Les CORS sont configurés côté backend

##  Build de Production

### Avec Docker (Recommandé)
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### Build manuel
```bash
npm run build
# Les fichiers sont dans le dossier /build
```

##  Sécurité

- L'application tourne derrière Nginx
- Headers de sécurité configurés dans `nginx.conf`
- Pas de données sensibles dans le code frontend

##  Support

En cas de problème :
1. Vérifiez les logs : `docker compose logs frontend`
2. Vérifiez les ports : `netstat -tulpn | grep 8081`
3. Redémarrez les services : `docker compose restart`

##  Notes

- Le frontend utilise React avec TypeScript
- Tailwind CSS pour le styling
- Axios pour les appels API
- React Router pour la navigation

---

**Maintenu par** : Équipe Bovann 
