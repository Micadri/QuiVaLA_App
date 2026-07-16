import { fetchPersonnel, fetchFormations, postVisit, postExit } from './api.js';
import { showScreen, populateSelect, renderTicket, renderExitConfirmation } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // ==========================================
    // GESTION DE L'INTERFACE DYNAMIQUE (UI)
    // ==========================================
    const linkNewVisitor = document.getElementById('link-new-visitor');
    const toggleNewVisitor = document.getElementById('toggle-new-visitor');
    const newVisitorFields = document.getElementById('new-visitor-fields');
    const prenomInput = document.getElementById('prenom');
    const nomInput = document.getElementById('nom');

    linkNewVisitor.addEventListener('click', (e) => {
        e.preventDefault();
        newVisitorFields.style.display = 'block';
        toggleNewVisitor.style.display = 'none';
        prenomInput.required = true;
        nomInput.required = true;
    });

    const resetFormUI = () => {
        document.getElementById('entry-form').reset();
        document.getElementById('exit-form').reset();
        newVisitorFields.style.display = 'none';
        toggleNewVisitor.style.display = 'block';
        prenomInput.required = false;
        nomInput.required = false;
        document.getElementById('bloc-personnel').style.display = 'none';
        document.getElementById('bloc-formation').style.display = 'none';
    };

    // ==========================================
    // NAVIGATION DU PARCOURS UTILISATEUR (SPA)
    // ==========================================
    document.getElementById('btn-start-entry').addEventListener('click', () => {
        showScreen('screen-form');
    });

    document.getElementById('btn-start-exit').addEventListener('click', () => {
        showScreen('screen-logout');
    });

    document.getElementById('btn-cancel-entry').addEventListener('click', () => {
        resetFormUI();
        showScreen('screen-home');
    });

    document.getElementById('btn-cancel-exit').addEventListener('click', () => {
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
    selectType.addEventListener('change', (e) => {
        document.getElementById('bloc-personnel').style.display = e.target.value === 'Visite' ? 'block' : 'none';
        document.getElementById('bloc-formation').style.display = e.target.value === 'Formation' ? 'block' : 'none';
    });

    // ==========================================
    // TRAITEMENT DU FORMULAIRE D'ENTRÉE
    // ==========================================
    const entryForm = document.getElementById('entry-form');
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDisplay = document.getElementById('form-error');
        errorDisplay.style.display = 'none';

        const formDataObj = Object.fromEntries(new FormData(e.target));
        const now = new Date();

        const formattedLocalDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        const formattedEntryTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // L'heure de sortie n'est plus calculée ni envoyée à l'entrée
        const fullyEnrichedPayload = {
            ...formDataObj,
            'date': formattedLocalDate,
            'heure_entree': formattedEntryTime
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

            renderTicket(fullyEnrichedPayload, targetName, assignedRoom, dynamicVisitorId, formattedEntryTime);
        } catch (error) {
            errorDisplay.textContent = "Erreur d'enregistrement. Veuillez réessayer.";
            errorDisplay.style.display = 'block';
        }
    });

    // ==========================================
    // TRAITEMENT DU FORMULAIRE DE SORTIE
    // ==========================================
    const exitForm = document.getElementById('exit-form');
    exitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDisplay = document.getElementById('exit-error');
        errorDisplay.style.display = 'none';

        const formDataObj = Object.fromEntries(new FormData(e.target));
        const now = new Date();
        const formattedExitTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const exitPayload = {
            'visiteur-email': formDataObj['visiteur-email'],
            'heure_sortie_reelle': formattedExitTime
        };

        try {
            await postExit(exitPayload);
            renderExitConfirmation(exitPayload['visiteur-email'], formattedExitTime);
        } catch (error) {
            errorDisplay.textContent = error.message;
            errorDisplay.style.display = 'block';
        }
    });
});