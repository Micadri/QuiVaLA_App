/**
 * Alterne l'affichage des conteneurs HTML (écrans) pour simuler une Single Page Application.
 * @param {string} screenId - L'ID de l'élément HTML block à afficher.
 */
export const showScreen = (screenId) => {
    const appScreens = ['screen-home', 'screen-form', 'screen-ticket'];
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
        optionElement.textContent = item.title.rendered; 
        
        // Cartographie sécurisée des locaux ACF selon le type de contenu
        if (item.acf && item.acf.local) {
            optionElement.dataset.local = item.acf.local;
        } else if (item.acf && item.acf['formation-local']) {
            optionElement.dataset.local = item.acf['formation-local'];
        }
        
        selectComponent.appendChild(optionElement);
    });
};

/**
 * Construit structurellement le ticket d'étiquette visiteur et l'injecte dans la vue finale.
 * @param {Object} formData - Données d'identité extraites du formulaire.
 * @param {string} targetName - Nom de la personne ou intitulé de la formation.
 * @param {string} assignedRoom - Salle ou local cible.
 * @param {number|string} visitorId - Identifiant unique généré en base de données.
 * @param {string} entryTime - Heure locale d'entrée capturée.
 * @param {string} exitTime - Heure de sortie estimée automatiquement à +2h.
 */
export const renderTicket = (formData, targetName, assignedRoom, visitorId, entryTime, exitTime) => {
    const ticketContainer = document.getElementById('ticket-content');
    if (!ticketContainer) return;

    ticketContainer.innerHTML = `
        <p><strong>Visiteur :</strong> ${formData['visiteur-prenom']} ${formData['visiteur-nom']}</p>
        <p><strong>Date :</strong> ${formData.date}</p>
        <p><strong>Heure d'Arrivée :</strong> ${entryTime}</p>
        <p><strong>Heure de Sortie Prévue (+2h) :</strong> ${exitTime}</p>
        <hr style="border-top: 1px dashed #000;">
        <p><strong>Rendez-vous :</strong> ${targetName}</p>
        <p><strong>Localisation :</strong> ${assignedRoom}</p>
        <p style="font-size: 18px; margin-top: 10px;"><strong>VOTRE IDENTIFIANT COMPLET : ${visitorId}</strong></p>
    `;
    
    // Transition visuelle vers l'écran du ticket
    showScreen('screen-ticket');
};