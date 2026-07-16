/**
 * Alterne l'affichage des conteneurs HTML (écrans) pour simuler une Single Page Application.
 * @param {string} screenId - L'ID de l'élément HTML block à afficher.
 */
export const showScreen = (screenId) => {
    const appScreens = ['screen-home', 'screen-form', 'screen-logout', 'screen-ticket'];
    appScreens.forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    document.getElementById(screenId).style.display = 'block';
};

/**
 * Alimente dynamiquement un composant select HTML avec les titres et métadonnées de l'API.
 * @param {string} selectId - L'ID du composant HTML select ciblé.
 * @param {Array} data - Tableau d'objets (Personnel ou Formations) reçus de WordPress.
 */
export const populateSelect = (selectId, data) => {
    const selectComponent = document.getElementById(selectId);
    selectComponent.innerHTML = '<option value="">-- Sélectionnez --</option>';
    
    data.forEach(item => {
        const optionElement = document.createElement('option');
        optionElement.value = item.id; 
        
        // On affiche le titre natif de WordPress dans le menu déroulant
        optionElement.textContent = item.title.rendered; 
        
        // CORRECTION ICI : Ciblage strict des vraies clés ACF retournées par l'API
        if (item.acf && item.acf['personnel-local']) {
            optionElement.dataset.local = item.acf['personnel-local'];
        } else if (item.acf && item.acf['formation-local']) {
            optionElement.dataset.local = item.acf['formation-local'];
        }
        
        selectComponent.appendChild(optionElement);
    });
};

/**
 * Construit structurellement le ticket d'étiquette visiteur et l'injecte dans la vue finale.
 */
export const renderTicket = (formData, targetName, assignedRoom, visitorId, entryTime) => {
    document.getElementById('ticket-title').textContent = "Entrée validée !";
    document.getElementById('ticket-subtitle').style.display = 'block';
    
    const ticketContainer = document.getElementById('ticket-content');
    if (!ticketContainer) return;

    ticketContainer.innerHTML = `
        <p><strong>Visiteur :</strong> ${formData['visiteur-prenom']} ${formData['visiteur-nom']}</p>
        <p><strong>Date :</strong> ${formData.date}</p>
        <p><strong>Heure d'Arrivée :</strong> ${entryTime}</p>
        <hr style="border-top: 1px dashed #000;">
        <p><strong>Rendez-vous :</strong> ${targetName}</p>
        <p><strong>Localisation :</strong> ${assignedRoom}</p>
        <p style="font-size: 18px; margin-top: 10px;"><strong>VOTRE IDENTIFIANT COMPLET : ${visitorId}</strong></p>
    `;
    showScreen('screen-ticket');
};

/**
 * Affiche l'écran de confirmation de sortie définitive.
 */
export const renderExitConfirmation = (email, exitTime) => {
    document.getElementById('ticket-title').textContent = "Merci de votre visite !";
    document.getElementById('ticket-subtitle').style.display = 'none';
    
    const ticketContainer = document.getElementById('ticket-content');
    if (!ticketContainer) return;

    ticketContainer.innerHTML = `
        <p>Votre départ a bien été enregistré.</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Heure de départ notée :</strong> ${exitTime}</p>
        <p>Passez une excellente fin de journée.</p>
    `;
    showScreen('screen-ticket');
};