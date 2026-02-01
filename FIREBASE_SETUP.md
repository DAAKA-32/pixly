# Pixly - Firebase Configuration Guide

Ce guide détaille la configuration complète de Firebase pour Pixly.

## Table des matières

1. [Configuration Firebase Console](#1-configuration-firebase-console)
2. [Variables d'environnement](#2-variables-denvironnement)
3. [Déploiement des règles](#3-déploiement-des-règles)
4. [Collections Firestore](#4-collections-firestore)
5. [Indexes requis](#5-indexes-requis)
6. [Règles de sécurité](#6-règles-de-sécurité)

---

## 1. Configuration Firebase Console

### Authentication

Dans Firebase Console > Authentication > Sign-in method, activez :

1. **Email/Password**
   - Activer "Email/Password"
   - Désactiver "Email link (passwordless sign-in)" si non nécessaire

2. **Google OAuth**
   - Activer "Google"
   - Configurer le nom du projet et l'email de support
   - Ajouter les domaines autorisés dans "Authorized domains"

### Firestore Database

1. Créer une base de données Firestore
2. Sélectionner le mode "Production" (règles sécurisées)
3. Choisir la région (ex: `europe-west1` pour la France)

### Storage

1. Activer Cloud Storage
2. Sélectionner la région (même que Firestore recommandé)

---

## 2. Variables d'environnement

### Client (`.env.local`)

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Admin (Server-side)

Pour les opérations server-side (API routes), vous devez créer un Service Account :

1. Firebase Console > Project Settings > Service Accounts
2. Cliquer "Generate new private key"
3. Télécharger le fichier JSON

Ajoutez ces variables à `.env.local` :

```env
# Firebase Admin Configuration
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Important**: La clé privée doit inclure les `\n` pour les retours à la ligne.

---

## 3. Déploiement des règles

### Installation Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init
```

### Déployer les règles et indexes

```bash
# Déployer tout
npm run firebase:deploy

# Ou manuellement
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

---

## 4. Collections Firestore

### `users`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | string | Firebase UID |
| `email` | string | Email (requis) |
| `displayName` | string \| null | Nom d'affichage |
| `photoURL` | string \| null | URL photo profil |
| `createdAt` | Timestamp | Date création |
| `updatedAt` | Timestamp | Dernière mise à jour |
| `plan` | string | Plan: free, starter, growth, scale, unlimited |
| `workspaceIds` | string[] | IDs des workspaces |

### `workspaces`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | string | ID auto-généré |
| `name` | string | Nom du workspace |
| `ownerId` | string | ID du propriétaire |
| `memberIds` | string[] | IDs des membres |
| `pixelId` | string | ID du pixel (TRK_xxxxx) |
| `createdAt` | Timestamp | Date création |
| `settings` | object | Paramètres |
| `integrations` | object | Intégrations (Meta, Google, etc.) |

#### `settings` (sous-document)

| Champ | Type | Défaut |
|-------|------|--------|
| `timezone` | string | 'UTC' |
| `currency` | string | 'USD' |
| `attributionWindow` | number | 30 |
| `defaultAttributionModel` | string | 'last_click' |

#### `integrations` (sous-document)

Chaque plateforme (meta, google, stripe, shopify) contient :

| Champ | Type |
|-------|------|
| `connected` | boolean |
| `connectedAt` | Date \| null |
| `accountId` | string \| null |
| `accountName` | string \| null |
| `accessToken` | string \| null |
| `refreshToken` | string \| null |
| `expiresAt` | Date \| null |

### `events`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | string | ID auto-généré |
| `pixelId` | string | ID du pixel |
| `workspaceId` | string | ID workspace |
| `eventType` | string | Type: page_view, identify, lead, purchase, etc. |
| `eventName` | string | Nom de l'événement |
| `timestamp` | Timestamp | Date/heure |
| `sessionId` | string | ID de session |
| `fpid` | string | First-party ID |
| `clickIds` | object | IDs de clic (gclid, fbclid, etc.) |
| `hashedEmail` | string \| null | Email hashé SHA256 |
| `context` | object | Contexte (URL, device, etc.) |
| `properties` | object | Propriétés custom |
| `value` | number \| null | Valeur |
| `attributed` | boolean | Statut attribution |

### `sessions`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | string | ID de session |
| `pixelId` | string | ID du pixel |
| `workspaceId` | string | ID workspace |
| `fpid` | string | First-party ID |
| `startedAt` | Timestamp | Début session |
| `lastActivityAt` | Timestamp | Dernière activité |
| `landingPage` | string | Page d'atterrissage |
| `referrer` | string | Referrer |
| `clickIds` | object | IDs de clic |
| `events` | string[] | IDs des événements |
| `converted` | boolean | Converti |
| `conversionValue` | number \| null | Valeur conversion |

### `conversions`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | string | ID auto-généré |
| `workspaceId` | string | ID workspace |
| `eventId` | string | ID événement source |
| `pixelId` | string | ID du pixel |
| `type` | string | Type: lead, purchase |
| `value` | number | Valeur |
| `currency` | string | Devise |
| `timestamp` | Timestamp | Date/heure |
| `attribution` | object | Données d'attribution |
| `synced` | object | Statut sync plateformes |
| `refunded` | boolean | Remboursé |

---

## 5. Indexes requis

Ces indexes sont automatiquement déployés via `firestore.indexes.json` :

### Workspaces

- `memberIds` (Array contains)
- `pixelId` (Ascending)

### Events

- `workspaceId` (Asc) + `timestamp` (Desc)
- `workspaceId` (Asc) + `eventType` (Asc) + `timestamp` (Desc)

### Sessions

- `pixelId` (Asc) + `fpid` (Asc) + `lastActivityAt` (Desc)
- `workspaceId` (Asc) + `startedAt` (Desc)

### Conversions

- `workspaceId` (Asc) + `timestamp` (Desc)
- `workspaceId` (Asc) + `type` (Asc) + `timestamp` (Desc)
- `properties.stripeChargeId` (Asc)

---

## 6. Règles de sécurité

### Principes

1. **Authentification requise** : Toutes les opérations nécessitent une authentification
2. **Isolation des données** : Chaque utilisateur ne peut accéder qu'à ses propres données
3. **Membres de workspace** : Accès aux données de workspace via `memberIds`
4. **Écritures server-side** : Les événements, sessions et conversions sont créés côté serveur uniquement
5. **Validation des champs** : Types et formats validés dans les règles

### Résumé des permissions

| Collection | Lecture | Création | Mise à jour | Suppression |
|------------|---------|----------|-------------|-------------|
| users | Propriétaire | Propriétaire | Propriétaire | ❌ |
| workspaces | Membres | Authentifié | Propriétaire | Propriétaire |
| events | Membres | ❌ (Server) | ❌ | ❌ |
| sessions | Membres | ❌ (Server) | ❌ | ❌ |
| conversions | Membres | ❌ (Server) | ❌ | ❌ |

---

## Scripts disponibles

```bash
# Voir la documentation des collections
npm run firebase:docs

# Créer des données de démo
npm run firebase:init:demo

# Déployer les règles et indexes
npm run firebase:deploy
```

---

## Dépannage

### Erreur "Missing or insufficient permissions"

1. Vérifier que l'utilisateur est authentifié
2. Vérifier que l'utilisateur est membre du workspace (`memberIds`)
3. Déployer les règles : `firebase deploy --only firestore:rules`

### Erreur "Index required"

1. Cliquer sur le lien dans l'erreur pour créer l'index automatiquement
2. Ou déployer tous les indexes : `firebase deploy --only firestore:indexes`

### Erreur "invalid-api-key"

1. Vérifier les variables d'environnement dans `.env.local`
2. Vérifier que le projet Firebase est correctement configuré

---

## Contact

Pour toute question, consulter la documentation Firebase :
- https://firebase.google.com/docs/firestore
- https://firebase.google.com/docs/auth
- https://firebase.google.com/docs/storage
