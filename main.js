import { fetchPersonnel, fetchFormations, postVisit } from './api.js';
import { showScreen, populateSelect, renderTicket } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // ==========================================
    // GESTION DE L'INTERFACE DYNAMIQUE (UI)
    // ==========================================
    const linkNewVisitor = document.getElementById('link-new-visitor');
    const toggleNewVisitor = document.getElementById('toggle-new-visitor');
    const newVisitorFields = document.getElementById('new-visitor-fields');
    const prenomInput = document.getElementById('prenom');
    const nomInput = document.getElementById('nom');

    // Clic sur "Pas encore enregistré ?"
    linkNewVisitor.addEventListener('click', (e) => {
        e.preventDefault();
        newVisitorFields.style.display = 'block';
        toggleNewVisitor.style.display = 'none'; // On masque le lien
        prenomInput.required = true; // Devient obligatoire
        nomInput.required = true;    // Devient obligatoire
    });

    // Fonction pour tout remettre à zéro après une visite
    const resetFormUI = () => {
        document.getElementById('entry-form').reset();
        newVisitorFields.style.display = 'none';
        toggleNewVisitor.style.display = 'block';
        prenomInput.required = false;
        nomInput.required = false;
        document.getElementById('bloc-personnel').style.display = 'none';
        document.getElementById('bloc-formation').style.display = 'none';
    };

    // ==========================================
    // NAVIGATION DU PARCOURS UTILISATEUR
    // ==========================================
    document.getElementById('btn-start-entry').addEventListener('click', () => {
        showScreen('screen-form');
    });

    document.getElementById('btn-cancel').addEventListener('click', () => {
        resetFormUI();
        showScreen('screen-home');
    });

    document.getElementById('btn-finish').addEventListener('click', () => {
        resetFormUI();
        showScreen('screen-home');
    });

    // ==========================================
    // CHARGEMENT INITIAL DES DONNÉES DÉROULANTES
    // ==========================================
    const personnels = await fetchPersonnel();
    const formations = await fetchFormations();
    populateSelect('visite-personnel', personnels);
    populateSelect('visite-formation', formations);

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
    // GESTION DE LA SOUMISSION
    // ==========================================
    const entryForm = document.getElementById('entry-form');
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDisplay = document.getElementById('form-error');
        errorDisplay.style.display = 'none';

        const formDataObj = Object.fromEntries(new FormData(e.target));
        const localMachineDate = new Date();

        const day = String(localMachineDate.getDate()).padStart(2, '0');
        const month = String(localMachineDate.getMonth() + 1).padStart(2, '0');
        const year = localMachineDate.getFullYear();
        const formattedLocalDate = `${day}/${month}/${year}`;

        const entryHours = String(localMachineDate.getHours()).padStart(2, '0');
        const entryMinutes = String(localMachineDate.getMinutes()).padStart(2, '0');
        const formattedEntryTime = `${entryHours}:${entryMinutes}`;

        const exitMachineDate = new Date(localMachineDate.getTime());
        exitMachineDate.setHours(localMachineDate.getHours() + 2);

        const exitHours = String(exitMachineDate.getHours()).padStart(2, '0');
        const exitMinutes = String(exitMachineDate.getMinutes()).padStart(2, '0');
        const formattedExitTime = `${exitHours}:${exitMinutes}`;

        const fullyEnrichedPayload = {
            ...formDataObj,
            'date': formattedLocalDate,
            'heure_entree': formattedEntryTime,
            'heure_output_prevue': formattedExitTime
        };

        try {
            const response = await postVisit(fullyEnrichedPayload);
            const dynamicVisitorId = response.idVisiteur;
            
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

            renderTicket(fullyEnrichedPayload, targetName, assignedRoom, dynamicVisitorId, formattedEntryTime, formattedExitTime);

        } catch (error) {
            errorDisplay.textContent = "Erreur lors de l'enregistrement en base de données. Veuillez réessayer.";
            errorDisplay.style.display = 'block';
        }
    });
});