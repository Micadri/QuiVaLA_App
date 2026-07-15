# 📱 QuiVaLa - Application Visiteurs

**QuiVaLa** est la partie publique (interface tablette) de l'infrastructure numérique de gestion des flux d'entrées et de sorties. Cette application Single Page Application (SPA) est destinée à être placée à l'accueil d'une entreprise pour permettre aux visiteurs de s'enregistrer de manière autonome.

👤 **Auteur :** Adrien Micheroux
🔗 **Projet lié :** Ce dépôt fonctionne en tandem avec le dépôt `QuiVaLa_Admin` (Tableau de bord) et s'appuie sur une API Headless WordPress.

---

## 🛠️ Technologies Utilisées

Pour répondre aux exigences de performance et d'architecture, cette application est développée **sans aucun framework JavaScript** (ni Vue, ni React, ni Angular).

* **Vanilla JavaScript (ES6+) :** Architecture modulaire stricte (`import`/`export`) pour séparer la logique réseau, l'interface et le contrôleur principal.
* **HTML5 & CSS3 :** Structure native avec manipulation du DOM en temps réel.
* **Fetch API :** Communication asynchrone avec le serveur WordPress Headless.
* **Déploiement :** Prévu pour être hébergé sur Vercel.

---

## 🏗️ Architecture Modulaire

Le projet est ventilé en plusieurs fichiers pour respecter le principe de responsabilité unique (séparation logique) :

* `env.js` : (Ignoré par Git) Stockage des variables d'environnement (URL de l'API).
* `api.js` : Isolation de toutes les requêtes réseau (`GET` pour les listes, `POST` pour les entrées).
* `ui.js` : Manipulation du DOM, gestion de l'affichage des écrans (SPA) et génération de l'étiquette visiteur.
* `main.js` : Le contrôleur principal. Il écoute les événements, calcule les horodatages et orchestre la communication entre l'UI et l'API.

---

## ⚙️ Parcours Utilisateur (User Flow)

L'application fonctionne sur une seule page HTML (`index.html`) où les "écrans" s'alternent dynamiquement pour une fluidité maximale :

1. **Écran d'Accueil :** Le visiteur est invité à signaler sa présence.
2. **Formulaire Dynamique :** * Saisie des données d'identité (Nom, Prénom, Email).
   * Choix du motif : "Visite" ou "Formation".
   * Le formulaire s'adapte instantanément (via JS) pour proposer un menu déroulant chargé depuis l'API (Liste des employés ou Liste des cours du jour).
3. **Validation & Horodatage :** Le système calcule automatiquement l'heure locale d'entrée et estime l'heure de sortie (+2h).
4. **Génération du Ticket :** Affichage d'une étiquette numérique résumant le lieu de rendez-vous, la personne à voir et générant un **ID Visiteur unique**.

---

## 🚀 Étapes actuelles (Ce qui est fait)

* [x] **Structure SPA :** Implémentation du système de navigation sans rechargement de page.
* [x] **Consommation API (GET) :** Récupération asynchrone des membres du personnel et des formations depuis WordPress pour hydrater les menus déroulants.
* [x] **Logique Conditionnelle :** Affichage dynamique des champs du formulaire selon le motif de visite.
* [x] **Horodatage Automatique :** Script de calcul de la date, de l'heure d'entrée et de l'heure de sortie prévisionnelle basé sur l'horloge de la machine.
* [x] **Génération du Payload :** Construction d'un objet de données formaté et prêt à être envoyé à l'API pour l'enregistrement.
* [x] **Interface Étiquette :** Rendu visuel des données de confirmation pour le visiteur.

---

## 🎯 Étapes à venir (Roadmap)

### Version 1 (En cours)
* [ ] **Connexion Endpoint POST :** Remplacer la simulation actuelle par l'appel `fetch` final vers le nouvel endpoint public REST de WordPress.
* [ ] **Flux de Sortie :** Création du parcours permettant à un visiteur d'encoder son ID pour clôturer sa visite.
* [ ] **Flux de Retour :** Implémentation de la recherche par email pour les visiteurs fréquents (reconnaissance automatique).
* [ ] **Design (UI/UX) :** Application de la feuille de style CSS pour rendre l'interface tablette ergonomique et lisible.

### Version 2
* [ ] **Génération de QR Codes :** Transformer l'ID numérique de l'étiquette en QR Code scannable.
* [ ] **Scan de sortie/retour :** Intégration d'une librairie JS de lecture de QR Code via la caméra de la tablette pour automatiser les sorties et les retours sans saisie manuelle.