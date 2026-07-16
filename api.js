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

// Envoi du formulaire d'entrée vers l'endpoint Custom
export const postVisit = async (visitData) => {
    try {
        const res = await fetch(`${ENV.apiUrl}/quivala/v1/entree`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(visitData)
        });
        
        if (!res.ok) throw new Error("Erreur lors de l'enregistrement");
        return await res.json(); 
    } catch (error) {
        throw error;
    }
};