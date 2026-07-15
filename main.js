import { fetchPersonnel, fetchFormations, postVisit } from './api.js';
import { showScreen, populateSelect, renderTicket } from './ui.js';

/**
 * Point d'entrée principal de l'application Tablette Accueil (Bootstrap).
 * Gère la navigation SPA, l'injection des listes d'options et l'automatisation de l'horodatage.
 */
document.addEventListener('DOMContentLoaded', async () => {
    
    // ==========================================
    // NAVIGATION DU PARCOURS UTILISATEUR
    // ==========================================

    // Bouton "Je signale mon entrée"
    document.getElementById('btn-start-entry').addEventListener('click', () => {
        showScreen('screen-form');
    });

    // Bouton "Annuler" : réinitialise le formulaire et retourne à l'accueil
    document.getElementById('btn-cancel').addEventListener('click', () => {
        document.getElementById('entry-form').reset();
        showScreen('screen-home');
    });

    // Bouton "Terminer" : clôture le ticket et prépare l'application pour le suivant
    document.getElementById('btn-finish').addEventListener('click', () => {
        document.getElementById('entry-form').reset();
        showScreen('screen-home');
    });

    // ==========================================
    // CHARGEMENT INITIAL DES DONNÉES DÉROULANTES
    // ==========================================
    const personnels = await fetchPersonnel();
    const formations = await fetchFormations();
    populateSelect('visite-personnel', personnels);
    populateSelect('visite-formation', formations);

    // Logic conditionnelle : Affichage dynamique des sous-menus selon le type choisi
    const selectType = document.getElementById('visite-type');
    const blocPersonnel = document.getElementById('bloc-personnel');
    const blocFormation = document.getElementById('bloc-formation');

    selectType.addEventListener('change', (e) => {
        if (e.target.value === 'Visite') {
            blocPersonnel.style.display = 'block';
            blocFormation.style.display = 'none';
        } else if (e.target.value === 'Formation') {
            blocPersonnel.style.display = 'none';
            blocFormation.style.display = 'block';
        } else {
            blocPersonnel.style.display = 'none';
            blocFormation.style.display = 'none';
        }
    });

    // ==========================================
    // GESTION DE LA SOUMISSION ET DES LOGS TEMPORELS
    // ==========================================
    const entryForm = document.getElementById('entry-form');
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDisplay = document.getElementById('form-error');
        errorDisplay.style.display = 'none';

        // 1. Récupération des données d'identité du visiteur
        const formDataObj = Object.fromEntries(new FormData(e.target));

        // 2. Récupération et formatage automatique de la Date/Heure locale de la machine
        const localMachineDate = new Date();

        // Formatage de la date (ex: JJ/MM/AAAA)
        const day = String(localMachineDate.getDate()).padStart(2, '0');
        const month = String(localMachineDate.getMonth() + 1).padStart(2, '0');
        const year = localMachineDate.getFullYear();
        const formattedLocalDate = `${day}/${month}/${year}`;

        // Formatage de l'heure d'entrée (ex: HH:MM)
        const entryHours = String(localMachineDate.getHours()).padStart(2, '0');
        const entryMinutes = String(localMachineDate.getMinutes()).padStart(2, '0');
        const formattedEntryTime = `${entryHours}:${entryMinutes}`;

        // 3. Calcul automatique de l'heure de sortie (Heure d'entrée + 2h)
        const exitMachineDate = new Date(localMachineDate.getTime());
        exitMachineDate.setHours(localMachineDate.getHours() + 2);

        const exitHours = String(exitMachineDate.getHours()).padStart(2, '0');
        const exitMinutes = String(exitMachineDate.getMinutes()).padStart(2, '0');
        const formattedExitTime = `${exitHours}:${exitMinutes}`;

        // 4. Fusion des coordonnées du visiteur avec les logs temporels générés automatiquement
        const fullyEnrichedPayload = {
            ...formDataObj,
            'date': formattedLocalDate,
            'heure_entree': formattedEntryTime,
            'heure_output_prevue': formattedExitTime // Correspond à heure_entrée + 2h
        };

        console.log("Données complètes prêtes pour envoi à l'API :", fullyEnrichedPayload);

        try {
            // L'appel réel postVisit(fullyEnrichedPayload) sera activé avec ton endpoint custom.
            // const response = await postVisit(fullyEnrichedPayload);
            
            // Simulation d'une ID générée pour l'étiquette brute
            const simulatedVisitorId = Math.floor(Math.random() * 9000) + 1000;
            
            let targetName = '';
            let assignedRoom = '-';
            
            if (fullyEnrichedPayload['visite-type'] === 'Visite') {
                const selectElement = document.getElementById('visite-personnel');
                targetName = selectElement.options[selectElement.selectedIndex].text;
                assignedRoom = selectElement.options[selectElement.selectedIndex].dataset.local || 'Inconnu';
            } else if (fullyEnrichedPayload['visite-type'] === 'Formation') {
                const selectElement = document.getElementById('visite-formation');
                targetName = selectElement.options[selectElement.selectedIndex].text;
                assignedRoom = selectElement.options[selectElement.selectedIndex].dataset.local || 'Inconnu';
            }

            // Génération de l'étiquette de confirmation avec l'heure d'entrée et de sortie calculée
            renderTicket(fullyEnrichedPayload, targetName, assignedRoom, simulatedVisitorId, formattedEntryTime, formattedExitTime);

        } catch (error) {
            errorDisplay.textContent = "Erreur lors de l'enregistrement. Veuillez réessayer.";
            errorDisplay.style.display = 'block';
        }
    });
});