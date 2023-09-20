# Lier Back-end et front-end (Express et socket.io)

## Serveur Node.js avec express

### Installation d'express et des fichiers/dossiers nécessaires

```bash
npx express-generator
```

Vous obtiendrez la structure suivante

```bash
.
├── bin
│   └── www
├── public
│   ├── images
│   ├── javascripts
│   └── stylesheets
├── routes
│   ├── index.js
│   └── users.js
├── views
│   ├── error.pug
│   ├── index.pug
│   └── layout.pug
├── app.js
└── package.json
```

### Configuration

```bash
cd monDossier #par exemple generator
```

- Supprimer le dossier `views`

- Dans `routes/index.js`
  - modifier `res.render('index', { title: 'Express' });` par `res.json({ message: 'Welcome to the back-end!'});`

```js
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ message: 'Welcome to the back-end!'});
});

module.exports = router;

```

### Installation des dépendances

```bash
npm install
```

### Modifier `package.json`

Si vous avez Node.js version 20+
Dans package.json

`start : "node --watch app.js"`

```json
{
  "name": "back-end",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "start": "node --watch app.js"
  },
  "dependencies": {
    "cookie-parser": "~1.4.4",
    "debug": "~2.6.9",
    "express": "~4.16.1",
    "http-errors": "~1.6.3",
    "jade": "~1.11.0",
    "morgan": "~1.9.1",
    "socket.io": "^4.7.2"
  }
}
```

## Socket.io

### Installation

```bash
npm i socket.io
```

### Fichier app.js

```js
// app.js
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app); // Nous implémentons un serveur pour express et les sockets

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// Ici nous créons le serveur io en lui disant d'accepter toutes les origines (ip ou nom de domaine)
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  }
});

// Vos routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Evenements socket
// socket.emit pour emettre vers les clients front-ends
// socket.on pour recevoir depuis le front-end et emettre à nouveau (avec socket.broadcast.emit)
// socket.broadcast.emit pour emettre à tous les clients sauf celui qui a envoyé l'information
io.on('connection', (socket) => {
    console.log(`A user connected with socket ${socket.id}`);
    socket.emit('game', {user: 1, turn: 0})
    
    socket.on("newTurn", (msg) => {
        console.log(msg)
        socket.broadcast.emit("newTurn", msg)
  })
})

// Evenement serveur
server.listen(3000, () => {
    console.log('listening on *:3000');
})
```

```bash
npm run start # Localhost:3000
```

## Front - Coté client

- Créer un fichier `index.html` ou ajouter le code nécessaire à votre front-end.
- Pas besoin que le front et le back soient sur la même adresse.
- **⚠️ Remplacez `http://localhost:3000` par le host et le port que vous utilisez.**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Socket io coté client</h1>
    <button id="submitSocket">Submit socket</button>
    <div id="msgs"></div>
    <script src="http://localhost:3000/socket.io/socket.io.js"></script>
    <script>
      // On récupère le script socket via le back-end, c'est générer automatiquement par socket.io
        const socket = io('http://localhost:3000');

        const button = document.getElementById('submitSocket');
        const msgs = document.getElementById('msgs');
        let i = 0;
        button.addEventListener('click', (e) => {
            i++;
            // Modifie la div msgs en local. Pas de doublon car coté back-end on ne renvoie pas l'information à celui qui a envoyé le message (via broadcast.emit())
            msgs.innerHTML += `<p style="color:green">${socket.id} : ${i}</p>`;
            // On emet sur la route newTurn et on envoie les informations définies en dessous
            socket.emit("newTurn", 
                {id: socket.id ,player: 1, turn: i, move: 5}
            )
        })
        // Lorsqu'on reçoit un message sur newTurn, on ajoute a la div #msgs le html suivant
        socket.on("newTurn", (msg) => {
            msgs.innerHTML += `<p style="color:blue">${msg.id} : ${msg.turn}<p/>`;
        });
    </script>
</body>
</html>

```
