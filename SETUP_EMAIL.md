# Configuration de l'Envoi d'Emails - Blessing Event

## ✅ Configuration Actuelle

Le formulaire de contact est configuré pour envoyer les demandes directement à votre email : **blessingevent001@gmail.com**

## 🔧 Service Utilisé : Formspree

Nous utilisons [Formspree](https://formspree.io/) - un service gratuit et fiable pour l'envoi d'emails depuis les sites statiques.

## 📋 Étapes pour Activer l'Envoi d'Emails

### 1. Créer un Compte Formspree (Gratuit)

1. Allez sur https://formspree.io/
2. Cliquez sur "Get Started" ou "Sign Up"
3. Créez un compte avec votre email **blessingevent001@gmail.com**

### 2. Créer un Nouveau Formulaire

1. Une fois connecté, cliquez sur "+ New Form"
2. Donnez un nom à votre formulaire : "Blessing Event - Contact"
3. Formspree va générer une URL unique comme : `https://formspree.io/f/xwpeboqv`

### 3. Mettre à Jour le Code (Si nécessaire)

Si vous obtenez une URL différente, modifiez le fichier `components/Contact.tsx` :

```typescript
const response = await fetch('https://formspree.io/f/VOTRE_ID_ICI', {
```

Remplacez `VOTRE_ID_ICI` par l'ID de votre formulaire Formspree.

### 4. Vérifier votre Email

Après la première soumission du formulaire, Formspree enverra un email de confirmation à **blessingevent001@gmail.com**. Cliquez sur le lien pour activer le formulaire.

## 📧 Ce Que Vous Recevrez

Chaque fois qu'un visiteur soumet le formulaire, vous recevrez un email à **blessingevent001@gmail.com** contenant :

- **Nom du client**
- **Email du client**
- **Type d'événement souhaité**
- **Message détaillé**

## 🎯 Avantages

✅ **Gratuit** : Jusqu'à 50 soumissions/mois sur le plan gratuit
✅ **Fiable** : Service utilisé par des milliers de sites
✅ **Sécurisé** : Protection anti-spam intégrée
✅ **Simple** : Aucun serveur backend nécessaire
✅ **Notifications instantanées** : Recevez les demandes immédiatement

## 🔒 Alternative : Votre Propre Solution

Si vous préférez une solution auto-hébergée, vous pouvez :
1. Créer un backend Node.js avec Nodemailer
2. Utiliser Firebase Functions avec SendGrid
3. Utiliser EmailJS (aussi gratuit jusqu'à 200 emails/mois)

## 📱 Test du Formulaire

Une fois déployé sur Firebase :
1. Allez sur votre site
2. Remplissez le formulaire de contact
3. Cliquez sur "Envoyer ma Demande"
4. Vérifiez votre boîte mail **blessingevent001@gmail.com**

## ⚠️ Important

- Le premier email nécessite une confirmation pour activer Formspree
- Vérifiez aussi vos spams si vous ne recevez pas l'email de confirmation
- Le plan gratuit est limité à 50 soumissions/mois (largement suffisant pour commencer)

## 🎉 C'est Prêt !

Votre formulaire est maintenant configuré pour recevoir les demandes directement dans votre boîte mail !
