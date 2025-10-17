import * as readline from 'readline';
import * as mysql from 'mysql';
import { exec } from 'child_process';
import * as http from 'http';

//Cryptographic Failures A02
//The code shows sensitive credentials.
//For example the host, username and password.
//If the Repository is leaked people can use this sensitive infromation.
//One way to prevent it is do not store sensitive data unnecessarily. 
const dbConfig = {
    host: 'mydatabase.com',
    user: 'admin',
    password: 'secret123',
    database: 'mydb'
};

function getUserInput(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Enter your name: ', (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

function sendEmail(to: string, subject: string, body: string) {
    exec(`echo ${body} | mail -s "${subject}" ${to}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error sending email: ${error}`);
        }
    });
}


// Cryptographic failures A02
//The code uses http instead of https when getting the data from the website.
//The data is not encrypted and could be intercepted by the attackers.
// OWASP explains that this includes protocols such as HTTP, SMTP, and FTP.
//You can use https to help secure the data.
function getData(): Promise<string> {
    return new Promise((resolve, reject) => {
        http.get('http://insecure-api.com/get-data', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}


//A03 Injection
//The SQL query is built with string interpolation so user input gets mixed into the SQL.
//That means an attacker could inject SQL to read, modify, or delete data.
//Use positive server-side input validation to ensure only expected data types are accepted.
function saveToDb(data: string) {
    const connection = mysql.createConnection(dbConfig);
    const query = `INSERT INTO mytable (column1, column2) VALUES ('${data}', 'Another Value')`;

    connection.connect();
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
        } else {
            console.log('Data saved');
        }
        connection.end();
    });
}
//Broken access control A01
//The code allows anyone to save the data and send the emails.
//There are no authentication to check to see who is doing these actions.
//To help prevent as a example do not let someone save to the data base
//unless they are logged in and a authorized user
(async () => {
    const userInput = await getUserInput();
    const data = await getData();


//Cryptogrpahic failures
//The code is sending data in plaintext without encryption .
//If it gets in the wrong hands sensitive data can be exposed.
//Use TLS/HTTPS for data in transit and encryption at rest for stored data.
    saveToDb(data);
    sendEmail('admin@example.com', 'User Input', userInput);
})();