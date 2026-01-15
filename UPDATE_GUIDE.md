# Guide de Mise à Jour - Bioacoustic AI Decoder v2.0

## 🎉 Nouvelles Fonctionnalités

### Intégration AVES (Earth Species Project)
- Embeddings audio optimisés pour les vocalisations animales
- Analyse multidimensionnelle des caractéristiques sonores

### Visualisation 3D Interactive
- Nuage de points 3D représentant la structure audio
- Animation temps réel synchronisée avec la lecture
- Rotation et zoom interactifs
- Points actifs colorés selon l'énergie et la fréquence

### Nouveau Layout Vertical
```
┌─────────────────────────────────────┐
│   BIRD IDENTIFICATION & PHOTO        │ ← En haut
│   (Nom + Photo de l'oiseau)         │
├─────────────────────────────────────┤
│   SPECTRAL ANALYSIS                  │ ← Au milieu
│   (Spectrogramme + Waveform)        │
├─────────────────────────────────────┤
│   3D AUDIO EMBEDDING                 │ ← En bas
│   (Nuage de points 3D animé)        │
└─────────────────────────────────────┘
```

---

## 📋 Instructions de Mise à Jour (PC Windows/Mac/Linux)

### Étape 1 : Mettre à Jour le Code

Ouvrez un terminal dans le dossier du projet et exécutez :

```bash
cd /chemin/vers/bioacoustic-IA-decoder
git pull origin claude/audio-intent-detection-bLqeG
```

---

### Étape 2 : Mettre à Jour les Dépendances

#### A) Frontend (React)

```bash
# Installer les nouvelles dépendances (Three.js pour la 3D)
npm install
```

Nouvelles dépendances ajoutées :
- `three` : Bibliothèque 3D
- `@react-three/fiber` : Intégration React pour Three.js
- `@react-three/drei` : Helpers pour React Three Fiber

#### B) Backend (Python)

```bash
cd backend
pip install -r requirements.txt
```

Nouvelles dépendances ajoutées :
- `scikit-learn` : Pour la réduction dimensionnelle (PCA)
- `torch` : PyTorch pour AVES (optionnel)

---

### Étape 3 : Lancer l'Application

#### Terminal 1 : Backend Python

```bash
cd backend
python app.py
```

Vous devriez voir :
```
==================================================
Bioacoustic AI Decoder - Backend API
==================================================
Features:
  - BirdNET bird identification
  - AVES audio embeddings
  - 3D visualization support
==================================================
Starting server on http://localhost:5000
==================================================
```

**IMPORTANT** : Laissez ce terminal ouvert !

#### Terminal 2 : Frontend React

Ouvrez un **nouveau** terminal :

```bash
npm run dev
```

Vous devriez voir :
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:3000/
```

---

### Étape 4 : Tester la Nouvelle Interface

1. Ouvrez votre navigateur : **http://localhost:3000**

2. **Vérifiez les indicateurs** en bas de page :
   - ✅ Vert : "BirdNET backend connected" → Tout fonctionne
   - ⚠️ Jaune : Backend offline → Redémarrez le backend Python

3. **Testez avec un chant d'oiseau** :
   - Cliquez sur "Start Recording" OU
   - Uploadez un fichier audio

4. **Observez le nouveau layout** :
   - **Haut** : Photo + nom de l'oiseau détecté
   - **Milieu** : Spectrogramme coloré (bleu → jaune → rouge)
   - **Bas** : Nuage de points 3D animé

5. **Interagissez avec la 3D** :
   - **Glissez** pour faire pivoter
   - **Molette** pour zoomer
   - **Lecture audio** : Les points s'animent en temps réel !

---

## 🎨 Comprendre la Visualisation 3D

### Couleurs des Points

- **Vert néon pulsant** : Point actif (son en cours de lecture)
- **Gris foncé** : Point inactif

### Taille des Points

- Plus le point est **gros** → Plus l'énergie audio est élevée à cet instant

### Lignes de Connexion

- **Vertes épaisses** : Connexions actives (son en cours)
- **Grises fines** : Connexions inactives

### Structure du Nuage

- **Position X, Y, Z** : Représente les caractéristiques audio (MFCC, fréquence, énergie)
- **Points proches** : Sons similaires
- **Points éloignés** : Sons très différents

---

## 🔧 Dépannage

### Problème : Pas de visualisation 3D

**Solution** :
1. Vérifiez que le backend Python est démarré
2. Vérifiez la console navigateur (F12) pour les erreurs
3. Essayez de recharger la page (Ctrl + F5)

### Problème : La 3D est noire/vide

**Cause** : Pas assez de données audio

**Solution** :
- Enregistrez au moins 2-3 secondes d'audio
- Utilisez un fichier audio avec un chant d'oiseau distinct

### Problème : Les points ne s'animent pas

**Vérifiez** :
1. Que l'audio est en lecture (cliquez sur Play)
2. Que le backend a renvoyé `temporal_features`
3. Console navigateur pour les erreurs

### Problème : "Cannot find module 'three'"

**Solution** :
```bash
npm install
```

### Problème : Backend Python - ModuleNotFoundError

**Solution** :
```bash
cd backend
pip install -r requirements.txt
```

---

## 📊 Fichiers Modifiés/Ajoutés

### Backend
- ✅ `backend/aves_wrapper.py` - Nouveau : Intégration AVES
- ✅ `backend/app.py` - Modifié : Endpoint `/api/analyze/3d`
- ✅ `backend/requirements.txt` - Modifié : Ajout scikit-learn, torch

### Frontend
- ✅ `src/components/Audio3DVisualization.tsx` - Nouveau : Visualisation 3D
- ✅ `src/services/aves3DService.ts` - Nouveau : Service API 3D
- ✅ `src/App.tsx` - Modifié : Nouveau layout vertical
- ✅ `src/components/AudioVisualization.tsx` - Modifié : Callbacks temps réel
- ✅ `package.json` - Modifié : Ajout Three.js

---

## 🚀 Fonctionnalités Avancées

### Captures d'Écran de la 3D

Pour capturer la vue 3D :
1. Orientez la caméra comme désiré
2. Clic droit sur le canvas 3D
3. "Enregistrer l'image sous..."

### Analyse de Différents Sons

L'application gère maintenant :
- 🐦 Chants d'oiseaux (BirdNET)
- 🐱 Sons d'autres animaux (AVES)
- 🎵 Tout type de signal audio

### Données Exportées

Les embeddings 3D peuvent être utilisés pour :
- Classification automatique
- Recherche de similarité
- Analyse temporelle
- Visualisation scientifique

---

## 📖 Références

- **AVES** : https://github.com/earthspecies/aves
- **BirdNET** : https://github.com/kahst/BirdNET-Analyzer
- **Three.js** : https://threejs.org/

---

## ✅ Checklist de Vérification

Après la mise à jour, vérifiez que :

- [ ] Backend Python démarre sans erreur
- [ ] Frontend React démarre sans erreur
- [ ] Footer affiche "✓ BirdNET backend connected"
- [ ] L'upload/enregistrement audio fonctionne
- [ ] Photo de l'oiseau s'affiche en haut
- [ ] Spectrogramme s'affiche au milieu
- [ ] Nuage de points 3D s'affiche en bas
- [ ] La 3D est interactive (rotation, zoom)
- [ ] Les points s'animent pendant la lecture audio

---

## 🆘 Support

En cas de problème :

1. **Vérifiez la console** (F12 dans le navigateur)
2. **Vérifiez les logs** du terminal backend
3. **Redémarrez** les deux serveurs
4. **Videz le cache** du navigateur (Ctrl + Shift + R)

---

**Version** : 2.0.0
**Date** : Janvier 2026
**Compatibilité** : Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

🎉 **Profitez de la nouvelle visualisation 3D !** 🎉
