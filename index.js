import express from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

//create array of users
const createArray = () => {
    let users = [];
    const readFile = fileName => fs.readFileSync(fileName).toString('utf-8').split('$');
    let usersString = readFile('users.txt');
    for (let i = 0; i < usersString.length - 1; i++) {
        const jsonUser = JSON.parse(usersString[i]);
        users.push(jsonUser);
    }
    return users;
}

//validate jwt
const validate = req => {
    let token = req.header('authorization').split(' ')[1];
    const verify = jwt.verify(token, 'This-Is-The-SECRET-Key');
    return verify;
}

//Register a user
app.post('/register', (req, res) => {
    const { username, name, password } = req.body;

    if (!username || !password || !name) {
        res.status(400).send('Incomplete details');
    }

    const users = createArray();
    for (const user of users){
        if (user.username === username) {
            res.status(400).send('Username already exists');
        }
    }

    const user = JSON.stringify(req.body) + '$'; //Added dollar sign as it would help to split the data later, will not allow $ anywhere (during validation)
    fs.appendFile('users.txt', user, (err) => {
        if (err) throw err;
        console.log('User saved');
        res.send('User registered successfully');
    });
});

//Login a user
app.post('/login', (req, res) => {
    const username = req.body.username;
    
    const users = createArray();

    let userFound = false;
    
    for (let user of users) {
        if (user.username === username) {
            userFound = true;
            const accessToken = jwt.sign({username}, 'This-Is-The-SECRET-Key');
            res.send({accessToken: accessToken});
            break;
        }
    } if (!userFound) {
        res.status(400).send('User does not exist');
    }
});

//Validate token
app.get('/login/me', (req, res) => {
    const verify = validate(req);
    if (verify) {
        res.send('Hello ' + verify.username);
        console.log(verify);
    } else {
        res.send(401).send(error);
    }
});

//Update user

app.post('/update', (req, res) => {

    const verify = validate(req);
    if (!verify) {
        res.send(401).send(error);
    }
    else {
        const username = verify.username;
        const newName = req.body.name;
        console.log(newName);
    
        const users = createArray();
        const oldUserDetails = users.filter(user => user.username === username);
        let oldName = oldUserDetails[0].name;
    
        fs.readFile('users.txt', 'utf-8', (err, data) => {
            if (err) throw err;
            let newFunc = data.replace(oldName, newName);
        
            fs.writeFile('users.txt', newFunc, 'utf-8', (err, data) => {
                if (err) throw err;
                console.log('Done!');
                res.send('User updated');
            })
        })
    }
})

app.listen(3000, () => console.log('App running on port 3000'));