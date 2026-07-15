import { ENV } from './env.js';

// Récupère le personnel pour le menu déroulant
export const fetchPersonnel = async () => {
    try {
        const res = await fetch(`${ENV.apiUrl}/wp/v2/personnel`);
        if (!res.ok) throw new Error("Erreur réseau");
        return await res.json();
    } catch (error) {
        console.error("Erreur fetch personnel :", error);
        return [];
    }
};

// Récupère les formations pour le menu déroulant
export const fetchFormations = async () => {
    try {
        const res = await fetch(`${ENV.apiUrl}/wp/v2/formation`);
        if (!res.ok) throw new Error("Erreur réseau");
        return await res.json();
    } catch (error) {
        console.error("Erreur fetch formations :", error);
        return [];
    }
};

// Envoi du formulaire d'entrée
export const postVisit = async (visitData) => {
    try {
        // ⚠️ NOTE : Sur un WP classique, on ne peut pas faire de POST public.
        // Il faudra qu'on configure un endpoint custom (ex: /quivala/v1/entree) côté PHP, 
        // ou qu'on utilise un token générique "Application Password".
        // Pour l'instant, on simule l'appel.
        const res = await fetch(`${ENV.apiUrl}/quivala/v1/entree`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(visitData)
        });
        
        if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
        return await res.json(); // WP devrait renvoyer l'ID du visiteur généré et le local
    } catch (error) {
        throw error;
    }
};