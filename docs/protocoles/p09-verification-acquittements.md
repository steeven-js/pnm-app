# P09 — Verification Acquittements PNMDATA

**Categorie :** Portabilite
**Serveur :** vmqproportasync01
**Utilisateur :** porta_pnmv3
**Declencheur :** Verification quotidienne des acquittements fichiers PNMDATA

---

## Contexte

Verifier que les fichiers PNMDATA ont ete acquittes par tous les operateurs.

## Etapes

### 1. Consulter le log PnmAckManager

Le script PnmDataAckManager verifie automatiquement les acquittements.

```bash
ssh porta_pnmv3@vmqproportasync01
tail -f /home/porta_pnmv3/PortaSync/log/PnmAckManager.log
```

### 2. Verifier chaque operateur

Chaque operateur doit afficher "Check success" :
- Orange Caraibe
- Digicel AFG
- Outremer Telecom / SFR
- Dauphin Telecom
- UTS Caraibe
- Free Caraibes

Puis "Fin de Traitement" a la fin.

### 3. En cas de NOT FOUND

Si un fichier ACR n'est pas trouve :
1. Verifier sur le sFTP que le fichier .ACR a ete depose
2. Verifier les erreurs dans le log
3. Relancer manuellement si necessaire
