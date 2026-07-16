# 📱 QuiVaLa - Application Visiteurs

**QuiVaLa** est la partie publique (interface tablette) de l'infrastructure numérique de gestion des flux d'entrées et de sorties. Cette application Single Page Application (SPA) est destinée à être placée à l'accueil d'une entreprise pour permettre aux visiteurs de s'enregistrer de manière autonome.

👤 **Auteur :** Adrien Micheroux  
🔗 **Projet lié :** Ce dépôt fonctionne en tandem avec le dépôt `QuiVaLa_Admin` (Tableau de bord) et s'appuie sur une API Headless WordPress (via un plugin PHP custom pour les routes d'écriture).

---

## 🛠️ Technologies Utilisées

Pour répondre aux exigences de performance et d'architecture, cette application est développée **sans aucun framework JavaScript** (ni Vue, ni React, ni Angular).

* **Vanilla JavaScript (ES6+) :** Architecture modulaire stricte (`import`/`export`) pour séparer la logique réseau, l'interface et le contrôleur principal.
* **HTML5 & CSS3 :** Structure native avec manipulation du DOM en temps réel. Utilisation avancée des variables CSS (bascule dynamique Dark/Light) et de `@media print` pour le formatage des badges.
* **Fetch API :** Communication asynchrone avec le serveur WordPress Headless.
* **Déploiement :** Prévu pour être hébergé sur Vercel.

---

## 🏗️ Architecture Modulaire

Le projet est ventilé en plusieurs fichiers pour respecter le principe de responsabilité unique (séparation logique) :

* `env.js` : (Ignoré par Git) Stockage des variables d'environnement (URL de l'API).
* `api.js` : Isolation de toutes les requêtes réseau (`GET` pour les listes et les profils, `POST` pour les entrées et les sorties).
* `ui.js` : Manipulation du DOM, gestion de l'affichage des écrans (SPA) et génération de l'étiquette d'impression.
* `main.js` : Le contrôleur principal. Il écoute les événements, gère les toggles (ID/Email), calcule les horodatages dynamiques et orchestre la communication.
* `style.css` : Feuille de style dédiée, incluant le design system (Dark Luxury / Bento Grid), la logique de thème persistant, et la règle pour masquer l'interface et redimensionner le ticket au format badge (85x55mm) lors de l'impression.

---

## ⚙️ Parcours Utilisateur (User Flow)

L'application fonctionne sur une seule page HTML (`index.html`) avec une navigation fluide par alternance d'écrans optimisés pour le tactile :

1. **Écran d'Accueil :** Le visiteur a 3 options : **Première visite**, **Déjà venu (Retour)** ou **Sortie**.
2. **Identification Flexible :** 
   * **Nouveau Visiteur :** Saisie complète de l'identité (Prénom, Nom, Email). Création d'un profil unique avec un **Code PIN à 4 chiffres** autogénéré.
   * **Visiteur de Retour :** Le visiteur s'identifie rapidement avec son Code PIN ou son Email. Ses données sont récupérées depuis l'API et gelées pour éviter les doublons en base de données.
3. **Choix du Motif :** Indication de la raison ("Visite" ou "Formation") avec affichage dynamique des listes (Personnel ou Cours du jour).
4. **Validation & Impression :** Le système enregistre l'horodatage d'entrée, génère le badge et déclenche automatiquement la fenêtre d'impression (`window.print()`).
5. **Départ Autonome :** Au moment de quitter le bâtiment, le visiteur signale sa sortie en renseignant son Code PIN ou son Email. L'heure de départ est mise à jour sur sa visite active.

---

## 🚀 Étapes actuelles (Ce qui est fait)

* [x] **Structure SPA :** Implémentation du système de navigation fluide sans rechargement de page.
* [x] **Consommation API & Endpoints Custom :** Interfaçage réel avec le plugin WP (`/entree`, `/sortie`, `/visiteur`) et récupération des métadonnées ACF.
* [x] **Génération d'Identifiant Unique :** Création d'un Code PIN (ACF) à 4 chiffres attribué à vie pour chaque nouveau visiteur.
* [x] **Flux de Retour (Smart UI) :** Recherche asynchrone par PIN ou Email avec système de *toggle* pour faciliter l'identification des habitués.
* [x] **Flux de Sortie Unifié :** Parcours de déconnexion flexible (PIN ou Email) avec horodatage réel de départ venant clôturer la visite active.
* [x] **Impression Automatique du Badge :** Injection des données dans un template de ticket et déclenchement automatique de l'impression via une feuille de style spécifique (`@media print`).
* [x] **Design Global (UI/UX Premium) :** Interface optimisée pour un usage tactile (boutons massifs, carte centrale Bento) avec un style "Dark Luxury" et un bouton de basculement dynamique clair/sombre.

---

## 🎯 Étapes à venir (Roadmap)

### Version 1 (En cours)
* [ ] **Gestion des erreurs réseau :** Améliorer l'affichage des notifications en cas de perte de connexion de la borne.

### Version 2
* [ ] **Génération de QR Codes :** Intégrer la génération d'un QR Code sur le badge imprimé contenant le PIN du visiteur.
* [ ] **Scan de sortie/retour :** Intégration d'une librairie JS via la caméra de la tablette pour scanner le QR Code et automatiser les retours/sorties sans toucher l'écran.