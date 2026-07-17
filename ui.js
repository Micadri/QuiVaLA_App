export const showScreen = (screenId) => {
    const appScreens = ['screen-home', 'screen-form', 'screen-return-search', 'screen-return-confirm', 'screen-logout', 'screen-ticket'];
    appScreens.forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    document.getElementById(screenId).style.display = 'block';
};

export const populateSelect = (selectId, data) => {
    const selectComponent = document.getElementById(selectId);
    selectComponent.innerHTML = '<option value="">-- Sélectionnez --</option>';
    
    data.forEach(item => {
        const optionElement = document.createElement('option');
        optionElement.value = item.id; 
        optionElement.textContent = item.title.rendered; 
        
        if (item.acf && item.acf['personnel-local']) {
            optionElement.dataset.local = item.acf['personnel-local'];
        } else if (item.acf && item.acf['formation-local']) {
            optionElement.dataset.local = item.acf['formation-local'];
        }
        
        selectComponent.appendChild(optionElement);
    });
};

export const renderTicket = (formData, targetName, assignedRoom, visitorId, entryTime) => {
    document.getElementById('ticket-title').textContent = "Entrée validée !";
    document.getElementById('ticket-subtitle').style.display = 'block';
    
    const ticketContainer = document.getElementById('ticket-content');
    if (!ticketContainer) return;

    ticketContainer.innerHTML = `
        <h3 style="text-align: center; margin-top: 0; text-transform: uppercase;">Badge Visiteur</h3>
        <p><strong>Visiteur :</strong> ${formData['visiteur-prenom']} ${formData['visiteur-nom']}</p>
        <p><strong>Date :</strong> ${formData.date}</p>
        <p><strong>Heure d'Arrivée :</strong> ${entryTime}</p>
        <p><strong>Rendez-vous :</strong> ${targetName}</p>
        <p><strong>Localisation :</strong> ${assignedRoom}</p>
        
        <!-- NOUVEAU : Le conteneur centré pour le dessin du QR Code -->
        <div id="qrcode-container" style="display: flex; justify-content: center; margin-top: 15px;"></div>

        <div style="text-align: center; border: 2px solid black; padding: 5px; margin-top: 10px;">
            <strong>IDENTIFIANT MANUEL : ${visitorId}</strong>
        </div>
    `;
    
    showScreen('screen-ticket');

    // NOUVEAU : Génération instantanée du QR Code avec le PIN du visiteur
    const qrContainer = document.getElementById('qrcode-container');
    qrContainer.innerHTML = ''; // Sécurité : on vide le conteneur avant de dessiner
    
    new QRCode(qrContainer, {
        text: String(visitorId), // Le QR code contient strictement le code PIN
        width: 100,              // Taille adaptée pour l'impression de l'étiquette
        height: 100,
        colorDark : "#000000",   // Noir pour le contraste de l'imprimante thermique
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H // Haut niveau de correction d'erreur
    });
};

export const renderExitConfirmation = (identifier, exitTime) => {
    document.getElementById('ticket-title').textContent = "Merci de votre visite !";
    document.getElementById('ticket-subtitle').style.display = 'none';
    
    const ticketContainer = document.getElementById('ticket-content');
    if (!ticketContainer) return;

    ticketContainer.innerHTML = `
        <p>Votre départ a bien été enregistré.</p>
        <p><strong>Identifiant utilisé :</strong> ${identifier}</p>
        <p><strong>Heure de départ notée :</strong> ${exitTime}</p>
        <p>Passez une excellente fin de journée.</p>
    `;
    showScreen('screen-ticket');
};