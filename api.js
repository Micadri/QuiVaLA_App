import { ENV } from './env.js';

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

// NOUVELLE REQUETE : Cherche un visiteur par ID ou Email
export const fetchVisitor = async (query, mode = 'id') => {
    try {
        const url = mode === 'id' 
            ? `${ENV.apiUrl}/quivala/v1/visiteur?id=${query}` 
            : `${ENV.apiUrl}/quivala/v1/visiteur?email=${query}`;
            
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Visiteur introuvable");
        return data;
    } catch (error) {
        throw error;
    }
};

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

export const postExit = async (exitData) => {
    try {
        const res = await fetch(`${ENV.apiUrl}/quivala/v1/sortie`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exitData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erreur lors de la sortie");
        return data;
    } catch (error) {
        throw error;
    }
};