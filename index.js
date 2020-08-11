const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/signup', require('./routes/signup'));
app.use('/login', require('./routes/login'));
app.use('/protected', require('./routes/protected'));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', () => console.log('failed to connect to db'));
db.once('open', () => {
    console.log('connected to db');

    const port = process.env.PORT;
    app.listen(port, () => console.log(`listening on port ${port}`));
});
