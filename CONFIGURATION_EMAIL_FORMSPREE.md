# 📧 Configuration Email - Solution Actuelle et Améliorée

## ⚠️ Problème Résolu

L'erreur 404 avec Formspree a été corrigée. Le formulaire utilise maintenant **mailto** comme solution temporaire.

## 🔧 Solution Actuelle (Mailto)

Quand un client remplit le formulaire :
1. Son client email s'ouvre automatiquement (Gmail, Outlook, etc.)
2. L'email est pré-rempli avec toutes les informations
3. Il envoie l'email directement à **blessingevent001@gmail.com**

### ✅ Avantages
- Fonctionne immédiatement
- Pas de configuration nécessaire
- Gratuit

### ❌ Inconvénients
- Le client doit avoir un client email configuré
- Pas automatique (le client doit cliquer "Envoyer")

---

## 🚀 Solution Recommandée : Formspree (Gratuit)

Pour une expérience professionnelle et automatique, voici comment configurer Formspree :

### Étape 1 : Créer un Compte Formspree

1. Allez sur **https://formspree.io/**
2. Cliquez sur **"Get Started"**
3. Créez un compte avec **blessingevent001@gmail.com**

### Étape 2 : Créer un Formulaire

1. Une fois connecté, cliquez sur **"+ New Form"**
2. Nom du formulaire : **"Blessing Event - Contact"**
3. Formspree génère un ID unique, par exemple : `xABCd123`

### Étape 3 : Mettre à Jour le Code

Modifiez le fichier `components/Contact.tsx`, ligne 18 :

**Remplacez :**
```typescript
const mailtoLink = `mailto:blessingevent001@gmail.com?subject=...
```

**Par :**
```typescript
const response = await fetch('https://formspree.io/f/VOTRE_ID_ICI', {
  method: 'POST',
  body: formData,
  headers: {
    'Accept': 'application/json'
  }
});

if (response.ok) {
  setSubmitStatus('success');
  form.reset();
  setTimeout(() => setSubmitStatus('idle'), 5000);
} else {
  setSubmitStatus('error');
}
```

### Étape 4 : Activer le Formulaire

1. Après la première soumission, Formspree envoie un email de confirmation
2. Cliquez sur le lien dans l'email
3. Votre formulaire est actif !

---

## 🎯 Alternative : EmailJS (Aussi Gratuit)

Si vous préférez EmailJS :

1. Allez sur **https://www.emailjs.com/**
2. Créez un compte
3. Configurez un service email (Gmail)
4. Créez un template
5. Utilisez leur SDK JavaScript

---

## 📋 Ce que Vous Recevrez par Email

```
Nouvelle demande de devis - Blessing Event

Nom: Jean Dupont
Email: jean@example.com
Type d'événement: Mariage de Prestige

Message:
Nous souhaitons organiser notre mariage en juin...

---
Envoyé depuis le site Blessing Event
```

---

## ⚡ Pour Déployer

Une fois la solution choisie et configurée :

```powershell
npm run build
firebase deploy --only hosting
```

---

## 🆘 Besoin d'Aide ?

Si vous avez besoin d'aide pour configurer Formspree ou EmailJS, n'hésitez pas à demander !

Le formulaire fonctionne actuellement avec mailto, mais Formspree offrira une meilleure expérience utilisateur.
