const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Configuração da conexão com o MySQL
const connection = mysql.createConnection({
  host: 'db', // Nome do serviço do banco de dados no Docker Compose
  user: 'root',
  password: 'root',
  database: 'nodeapp'
});

// Função para tentar reconectar-se ao banco de dados em caso de erro
function handleDisconnect() {
  connection.connect(function(err) {
    if (err) {
      console.error('Error connecting to database:', err);
      setTimeout(handleDisconnect, 2000); // Tentar novamente após 2 segundos
    } else {
      console.log('Connected to database as id ' + connection.threadId);
    }
  });

  connection.on('error', function(err) {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNREFUSED') {
      handleDisconnect(); // Reconectar em caso de perda de conexão
    } else {
      throw err;
    }
  });
}

handleDisconnect(); // Iniciar a tentativa de conexão

// Rota para cadastrar um nome na tabela 'people'
app.get('/register/:name', (req, res) => {
  const { name } = req.params;
  const insertQuery = `INSERT INTO people (name) VALUES ('${name}')`;

  connection.query(insertQuery, (err, results) => {
    if (err) {
      console.error('Error inserting name:', err);
      res.status(500).send('Error inserting name');
      return;
    }

    console.log('Name inserted:', name);
    res.send('<h1>Full Cycle Rocks!</h1><p>Name registered successfully</p>');
  });
});

// Rota para listar todos os nomes cadastrados na tabela 'people'
app.get('/', (req, res) => {
  const selectQuery = 'SELECT * FROM people';

  connection.query(selectQuery, (err, results) => {
    if (err) {
      console.error('Error fetching names:', err);
      res.status(500).send('Error fetching names');
      return;
    }

    const names = results.map(result => result.name);
    const htmlResponse = `<h1>Full Cycle Rocks!</h1><p>Names:</p><ul>${names.map(name => `<li>${name}</li>`).join('')}</ul>`;
    res.send(htmlResponse);
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
