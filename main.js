import { fetchPersonnel, fetchFormations, fetchVisitor, postVisit, postExit } from './api.js';
import { showScreen, populateSelect, renderTicket, renderExitConfirmation } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // ==========================================
    // INITIALISATION DE L'INTERFACE (UI Reset)
    // ==========================================
    const resetFormUI = () => {
        document.getElementById('entry-form').reset();
        document.getElementById('return-search-form').reset();
        document.getElementById('return-visit-form').reset();
        document.getElementById('exit-form').reset();
        
        document.getElementById('bloc-personnel').style.display = 'none';
        document.getElementById('bloc-formation').style.display = 'none';
        document.getElementById('ret-bloc-personnel').style.display = 'none';
        document.getElementById('ret-bloc-formation').style.display = 'none';

        document.getElementById('search-mode').value = 'id';
        document.getElementById('search-id-group').style.display = 'block';
        document.getElementById('search-email-group').style.display = 'none';
        document.getElementById('link-toggle-search').textContent = "J'ai oublié mon ID, utiliser mon email";
        
        // Reset aussi le mode de sortie
        document.getElementById('exit-mode').value = 'id';
        document.getElementById('exit-id-group').style.display = 'block';
        document.getElementById('exit-email-group').style.display = 'none';
        const toggleExit = document.getElementById('link-toggle-exit');
        if(toggleExit) toggleExit.textContent = "J'ai oublié mon ID, utiliser mon email";
    };

    // ==========================================
    // NAVIGATION DU PARCOURS UTILISATEUR (SPA)
    // ==========================================
    document.getElementById('btn-start-entry').addEventListener('click', () => showScreen('screen-form'));
    document.getElementById('btn-start-return').addEventListener('click', () => showScreen('screen-return-search'));
    document.getElementById('btn-start-exit').addEventListener('click', () => showScreen('screen-logout'));

    ['btn-cancel-entry', 'btn-cancel-return-search', 'btn-cancel-return-confirm', 'btn-cancel-exit', 'btn-finish'].forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.addEventListener('click', () => {
            resetFormUI();
            showScreen('screen-home');
        });
    });

    // ==========================================
    // HYDRATATION DES LISTES DÉROULANTES
    // ==========================================
    const personnels = await fetchPersonnel();
    const formations = await fetchFormations();
    
    populateSelect('visite-personnel', personnels);
    populateSelect('visite-formation', formations);
    populateSelect('ret-visite-personnel', personnels);
    populateSelect('ret-visite-formation', formations);

    document.getElementById('visite-type').addEventListener('change', (e) => {
        document.getElementById('bloc-personnel').style.display = e.target.value === 'Visite' ? 'block' : 'none';
        document.getElementById('bloc-formation').style.display = e.target.value === 'Formation' ? 'block' : 'none';
    });

    document.getElementById('ret-visite-type').addEventListener('change', (e) => {
        document.getElementById('ret-bloc-personnel').style.display = e.target.value === 'Visite' ? 'block' : 'none';
        document.getElementById('ret-bloc-formation').style.display = e.target.value === 'Formation' ? 'block' : 'none';
    });

    const buildTimePayload = (formDataObj) => {
        const now = new Date();
        const formattedLocalDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        const formattedEntryTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return {
            ...formDataObj,
            'date': formattedLocalDate,
            'heure_entree': formattedEntryTime
        };
    };

    // ==========================================
    // FLUX 1 : NOUVEAU VISITEUR
    // ==========================================
    const entryForm = document.getElementById('entry-form');
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDisplay = document.getElementById('form-error');
        errorDisplay.style.display = 'none';

        const formDataObj = Object.fromEntries(new FormData(e.target));
        const payload = buildTimePayload(formDataObj);

        try {
            const response = await postVisit(payload);
            const dynamicVisitorId = response.pinVisiteur || response.idVisiteur;
            
            let targetName = '';
            let assignedRoom = '-';
            
            if (payload['visite-type'] === 'Visite') {
                const selectElement = document.getElementById('visite-personnel');
                targetName = selectElement.options[selectElement.selectedIndex].text;
                assignedRoom = selectElement.options[selectElement.selectedIndex].dataset.local || 'Inconnu';
            } else if (payload['visite-type'] === 'Formation') {
                const selectElement = document.getElementById('visite-formation');
                targetName = selectElement.options[selectElement.selectedIndex].text;
                assignedRoom = selectElement.options[selectElement.selectedIndex].dataset.local || 'Inconnu';
            }

            renderTicket(payload, targetName, assignedRoom, dynamicVisitorId, payload.heure_entree);
            
            // Impression automatique du badge
            setTimeout(() => { window.print(); }, 500);

        } catch (error) {
            errorDisplay.textContent = "Erreur d'enregistrement. Veuillez réessayer.";
            errorDisplay.style.display = 'block';
        }
    });

    // ==========================================
    // FLUX 2 : VISITEUR DE RETOUR
    // ==========================================
    document.getElementById('link-toggle-search').addEventListener('click', (e) => {
        e.preventDefault();
        const modeInput = document.getElementById('search-mode');
        
        if (modeInput.value === 'id') {
            document.getElementById('search-id-group').style.display = 'none';
            document.getElementById('search-email-group').style.display = 'block';
            modeInput.value = 'email';
            e.target.textContent = "Je veux utiliser mon numéro d'ID";
        } else {
            document.getElementById('search-id-group').style.display = 'block';
            document.getElementById('search-email-group').style.display = 'none';
            modeInput.value = 'id';
            e.target.textContent = "J'ai oublié mon ID, utiliser mon email";
        }
    });

    document.getElementById('return-search-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDisplay = document.getElementById('search-error');
        errorDisplay.style.display = 'none';

        const mode = document.getElementById('search-mode').value;
        const query = mode === 'id' ? document.getElementById('search-id').value : document.getElementById('search-email').value;

        if (!query) {
            errorDisplay.textContent = "Veuillez remplir le champ de recherche.";
            errorDisplay.style.display = 'block';
            return;
        }

        try {
            const visitor = await fetchVisitor(query, mode);
            
            document.getElementById('ret-prenom').textContent = visitor.prenom;
            document.getElementById('ret-nom').textContent = visitor.nom;
            document.getElementById('ret-email').textContent = visitor.email;
            
            document.getElementById('ret-input-email').value = visitor.email;
            document.getElementById('ret-input-pin').value = visitor.id; 

            showScreen('screen-return-confirm');
        } catch (error) {
            errorDisplay.textContent = error.message;
            errorDisplay.style.display = 'block';
        }
    });

    document.getElementById('return-visit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDisplay = document.getElementById('ret-form-error');
        errorDisplay.style.display = 'none';

        const formDataObj = Object.fromEntries(new FormData(e.target));
        const payload = buildTimePayload(formDataObj);
        
        payload['visiteur-prenom'] = document.getElementById('ret-prenom').textContent;
        payload['visiteur-nom'] = document.getElementById('ret-nom').textContent;

        try {
            const response = await postVisit(payload);
            const dynamicVisitorId = response.pinVisiteur || response.idVisiteur;
            
            let targetName = '';
            let assignedRoom = '-';
            
            if (payload['visite-type'] === 'Visite') {
                const selectElement = document.getElementById('ret-visite-personnel');
                targetName = selectElement.options[selectElement.selectedIndex].text;
                assignedRoom = selectElement.options[selectElement.selectedIndex].dataset.local || 'Inconnu';
            } else if (payload['visite-type'] === 'Formation') {
                const selectElement = document.getElementById('ret-visite-formation');
                targetName = selectElement.options[selectElement.selectedIndex].text;
                assignedRoom = selectElement.options[selectElement.selectedIndex].dataset.local || 'Inconnu';
            }

            renderTicket(payload, targetName, assignedRoom, dynamicVisitorId, payload.heure_entree);
            
            // Impression automatique du badge
            setTimeout(() => { window.print(); }, 500);

        } catch (error) {
            errorDisplay.textContent = "Erreur d'enregistrement. Veuillez réessayer.";
            errorDisplay.style.display = 'block';
        }
    });

    // ==========================================
    // FLUX 3 : SORTIE DU BÂTIMENT (CORRIGÉ)
    // ==========================================
    const linkToggleExit = document.getElementById('link-toggle-exit');
    if (linkToggleExit) {
        linkToggleExit.addEventListener('click', (e) => {
            e.preventDefault();
            const modeInput = document.getElementById('exit-mode');
            if (modeInput.value === 'id') {
                document.getElementById('exit-id-group').style.display = 'none';
                document.getElementById('exit-email-group').style.display = 'block';
                modeInput.value = 'email';
                e.target.textContent = "Je veux utiliser mon numéro d'ID";
            } else {
                document.getElementById('exit-id-group').style.display = 'block';
                document.getElementById('exit-email-group').style.display = 'none';
                modeInput.value = 'id';
                e.target.textContent = "J'ai oublié mon ID, utiliser mon email";
            }
        });
    }

    const exitForm = document.getElementById('exit-form');
    exitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDisplay = document.getElementById('exit-error');
        errorDisplay.style.display = 'none';

        // On récupère directement les valeurs tapées par l'utilisateur
        const mode = document.getElementById('exit-mode').value;
        const query = mode === 'id' ? document.getElementById('exit-id').value : document.getElementById('exit-email').value;
        
        if (!query) {
            errorDisplay.textContent = "Veuillez entrer votre ID ou votre email.";
            errorDisplay.style.display = 'block';
            return;
        }

        const now = new Date();
        const formattedExitTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Construction du nouveau format attendu par le PHP
        const exitPayload = {
            'identifier': query, 
            'mode': mode,
            'heure_sortie_reelle': formattedExitTime
        };

        try {
            await postExit(exitPayload);
            renderExitConfirmation(query, formattedExitTime);
        } catch (error) {
            errorDisplay.textContent = error.message;
            errorDisplay.style.display = 'block';
        }
    });
});