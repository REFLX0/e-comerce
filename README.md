# Bestoil - E-Commerce Plateforme

Bienvenue sur le dépôt de la plateforme e-commerce Bestoil. Ce projet est structuré en mode **Monorepo** afin de faciliter le déploiement de l'application complète via Docker, séparant ainsi le Frontend (interface utilisateur) du futur Backend (API).

## 📁 Architecture du projet

Le projet contient deux dossiers principaux :

- `/frontend` : Contient l'intégralité du code de l'application Next.js (Interface utilisateur, React, TailwindCSS, etc.).
- `/backend` : Dossier préparé pour accueillir le code de votre future API.

## 🚀 Démarrage en développement local

Puisque le projet est scindé en deux dossiers distincts, vous devez vous placer dans le dossier concerné pour lancer les commandes de développement.

### Lancer le Frontend (Next.js)

1. Ouvrez votre terminal.
2. Placez-vous dans le dossier `frontend` :
   ```bash
   cd frontend
   ```
3. Installez les dépendances (si ce n'est pas déjà fait) :
   ```bash
   npm install
   ```
4. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
5. L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

*(Note : Actuellement, le frontend utilise des "Mocks APIs" locaux simulant les données pour pouvoir travailler sans attendre le backend).*

## 🐳 Utilisation avec Docker (Production / Déploiement)

Le projet est entièrement configuré pour être déployé à l'aide de Docker Compose. Le frontend a été optimisé (mode `standalone`) pour générer une image extrêmement légère.

### Lancer tous les services

À la racine du projet (là où se trouve le fichier `docker-compose.yml`), exécutez la commande suivante :

```bash
docker-compose up --build -d
```

Cela va :
1. Construire l'image Docker optimisée du `frontend` et la lancer sur le port `3000`.
2. Lancer le service `backend` sur le port `8000` (dès que votre API sera prête).

Pour arrêter les conteneurs :
```bash
docker-compose down
```

## ⚙️ Configuration (Variables d'Environnement)

Pour que le frontend puisse communiquer avec le backend, nous utilisons la variable d'environnement `NEXT_PUBLIC_API_URL`.

- **En local (sans Docker)** : Si vous n'avez pas de fichier `.env.local` configuré, l'application pointe automatiquement vers ses fausses APIs internes (`/api/...`).
- **Via Docker** : Le fichier `docker-compose.yml` injecte automatiquement `NEXT_PUBLIC_API_URL=http://backend:8000/api` pour que le frontend communique avec le conteneur du backend.

## 🛠 Technologies Utilisées

- **Frontend** : Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, Zustand, React Query.
- **Backend** : *(À venir)*
- **Déploiement** : Docker, Docker Compose.
