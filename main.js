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
        
        // Reset des blocs d'options
        document.getElementById('bloc-personnel').style.display = 'none';
        document.getElementById('bloc-formation').style.display = 'none';
        document.getElementById('ret-bloc-personnel').style.display = 'none';
        document.getElementById('ret-bloc-formation').style.display = 'none';

        // Reset du toggle de recherche
        document.getElementById('search-mode').value = 'id';
        document.getElementById('search-id-group').style.display = 'block';
        document.getElementById('search-email-group').style.display = 'none';
        document.getElementById('link-toggle-search').textContent = "J'ai oublié mon ID, utiliser mon email";
    };

    // ==========================================
    // NAVIGATION DU PARCOURS UTILISATEUR (SPA)
    // ==========================================
    document.getElementById('btn-start-entry').addEventListener('click', () => showScreen('screen-form'));
    document.getElementById('btn-start-return').addEventListener('click', () => showScreen('screen-return-search'));
    document.getElementById('btn-start-exit').addEventListener('click', () => showScreen('screen-logout'));

    // Boutons d'annulation -> retour accueil
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
    
    // On hydrate les deux formulaires (Nouveau ET Retour)
    populateSelect('visite-personnel', personnels);
    populateSelect('visite-formation', formations);
    populateSelect('ret-visite-personnel', personnels);
    populateSelect('ret-visite-formation', formations);

    // Écouteurs de condition d'affichage (Nouveau visiteur)
    document.getElementById('visite-type').addEventListener('change', (e) => {
        document.getElementById('bloc-personnel').style.display = e.target.value === 'Visite' ? 'block' : 'none';
        document.getElementById('bloc-formation').style.display = e.target.value === 'Formation' ? 'block' : 'none';
    });

    // Écouteurs de condition d'affichage (Visiteur de retour)
    document.getElementById('ret-visite-type').addEventListener('change', (e) => {
        document.getElementById('ret-bloc-personnel').style.display = e.target.value === 'Visite' ? 'block' : 'none';
        document.getElementById('ret-bloc-formation').style.display = e.target.value === 'Formation' ? 'block' : 'none';
    });

    // ==========================================
    // MÉTHODE COMMUNE DE PAYLOAD TEMPOREL
    // ==========================================
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
            const dynamicVisitorId = response.idVisiteur;
            
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
        } catch (error) {
            errorDisplay.textContent = "Erreur d'enregistrement. Veuillez réessayer.";
            errorDisplay.style.display = 'block';
        }
    });

    // ==========================================
    // FLUX 2 : VISITEUR DE RETOUR (RECHERCHE & CONFIRMATION)
    // ==========================================
    
    // Toggle entre recherche par ID ou Email
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

    // Soumission de la recherche
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
            
            // Injection des données dans la page de confirmation
            document.getElementById('ret-prenom').textContent = visitor.prenom;
            document.getElementById('ret-nom').textContent = visitor.nom;
            document.getElementById('ret-email').textContent = visitor.email;
            document.getElementById('ret-input-email').value = visitor.email; // Indispensable pour la création de visite

            showScreen('screen-return-confirm');
        } catch (error) {
            errorDisplay.textContent = error.message;
            errorDisplay.style.display = 'block';
        }
    });

    // Soumission de la nouvelle visite (Retour)
    document.getElementById('return-visit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDisplay = document.getElementById('ret-form-error');
        errorDisplay.style.display = 'none';

        const formDataObj = Object.fromEntries(new FormData(e.target));
        const payload = buildTimePayload(formDataObj);
        
        // On récupère manuellement le prénom et nom pour l'étiquette graphique (car non soumis dans ce form)
        payload['visiteur-prenom'] = document.getElementById('ret-prenom').textContent;
        payload['visiteur-nom'] = document.getElementById('ret-nom').textContent;

        try {
            // L'API PHP gère la reconnaissance d'email via postVisit()
            const response = await postVisit(payload);
            const dynamicVisitorId = response.idVisiteur;
            
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
        } catch (error) {
            errorDisplay.textContent = "Erreur d'enregistrement. Veuillez réessayer.";
            errorDisplay.style.display = 'block';
        }
    });

    // ==========================================
    // FLUX 3 : SORTIE DU BÂTIMENT
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