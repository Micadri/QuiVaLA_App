# 📱 QuiVaLa - Application Visiteurs

**QuiVaLa** est la partie publique (interface tablette) de l'infrastructure numérique de gestion des flux d'entrées et de sorties. Cette application Single Page Application (SPA) est destinée à être placée à l'accueil d'une entreprise pour permettre aux visiteurs de s'enregistrer de manière autonome.

👤 **Auteur :** Adrien Micheroux  
🔗 **Projet lié :** Ce dépôt fonctionne en tandem avec le dépôt `QuiVaLa_Admin` (Tableau de bord) et s'appuie sur une API Headless WordPress (via un plugin PHP custom pour les routes d'écriture).

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
* `api.js` : Isolation de toutes les requêtes réseau (`GET` pour les listes de personnel/formations, `POST` pour les entrées et les sorties).
* `ui.js` : Manipulation du DOM, gestion de l'affichage des écrans (SPA) et génération des écrans de confirmation (étiquette d'entrée et validation de sortie).
* `main.js` : Le contrôleur principal. Il écoute les événements, calcule les horodatages dynamiques et orchestre la communication entre l'UI et l'API.

---

## ⚙️ Parcours Utilisateur (User Flow)

L'application fonctionne sur une seule page HTML (`index.html`) où les "écrans" s'alternent dynamiquement pour une fluidité maximale :

1. **Écran d'Accueil :** Le visiteur est invité à signaler son **entrée** ou sa **sortie**.
2. **Formulaire d'Entrée Intelligent :** 
   * **Reconnaissance :** Saisie de l'adresse email en priorité. Si le visiteur est nouveau, un clic permet de dévoiler les champs "Prénom" et "Nom".
   * **Motif :** Choix entre "Visite" ou "Formation". Le formulaire s'adapte instantanément (via JS) pour proposer un menu déroulant chargé depuis l'API (Liste des employés ou Liste des cours du jour).
3. **Validation & Horodatage :** Le système calcule automatiquement la date et l'heure locale d'entrée. L'heure de sortie est laissée volontairement vide dans la base de données.
4. **Génération du Ticket :** Affichage d'une étiquette numérique résumant le lieu de rendez-vous, la personne à voir et rappelant l'**ID Visiteur unique**.
5. **Formulaire de Sortie :** Au moment de quitter le bâtiment, le visiteur encode simplement son adresse email. Le système horodate la sortie de manière précise sur sa dernière visite active.

---

## 🚀 Étapes actuelles (Ce qui est fait)

* [x] **Structure SPA :** Implémentation du système de navigation sans rechargement de page.
* [x] **Consommation API (GET) :** Récupération asynchrone des membres du personnel et des formations depuis WordPress (incluant les métadonnées ACF de localisation).
* [x] **Logique Conditionnelle :** Affichage dynamique des champs du formulaire selon le motif de visite.
* [x] **Connexion Endpoints POST :** Interfaçage réel avec le plugin WP custom (`/quivala/v1/entree` et `/quivala/v1/sortie`).
* [x] **Flux de Retour (Smart UI) :** Interface adaptative reconnaissant l'email pour éviter la resaisie du prénom/nom aux visiteurs fréquents.
* [x] **Flux de Sortie :** Parcours de déconnexion par email avec horodatage réel de départ (remplaçant l'ancienne logique d'estimation de +2h).
* [x] **Génération du Payload :** Construction et formatage des données temporelles (basées sur l'horloge locale) avant envoi sécurisé.

---

## 🎯 Étapes à venir (Roadmap)

### Version 1 (En cours)
* [ ] **Design (UI/UX) :** Application de la feuille de style CSS pour rendre l'interface tablette ergonomique, accessible et visuellement professionnelle.
* [ ] **Gestion des erreurs API (Feedback visuel) :** Améliorer l'affichage des notifications en cas de perte de connexion réseau sur la borne.

### Version 2
* [ ] **Génération de QR Codes :** Transformer l'ID numérique de l'étiquette en QR Code scannable.
* [ ] **Scan de sortie/retour :** Intégration d'une librairie JS de lecture de QR Code via la caméra de la tablette pour automatiser les sorties et les retours sans saisie manuelle de l'email.