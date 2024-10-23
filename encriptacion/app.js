const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Para manejar solicitudes JSON
const PORT = 3009;

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',       // Reemplaza con tu usuario de PostgreSQL
  host: 'localhost',
  database: 'password_manager',
  password: 'root', // Reemplaza con tu contraseña de PostgreSQL
  port: 5432,
});

// Clave y IV para cifrado simétrico (deben ser constantes)
const algorithm = 'aes-256-cbc'; 
const secretKey = crypto.createHash('sha256').update(String('mi_clave_secreta')).digest('base64').substr(0, 32);
const iv = Buffer.alloc(16, 0); // Inicialización del vector (puedes cambiarlo si lo deseas)

// Claves para cifrado asimétrico
const publicKey = fs.readFileSync('public_key.pem', 'utf8');
const privateKey = fs.readFileSync('private_key.pem', 'utf8');

// Funciones de cifrado y descifrado asimétrico
const encryptAsymmetric = (text) => {
  const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(text));
  return encrypted.toString('base64');
};

const decryptAsymmetric = (encryptedText) => {
  const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(encryptedText, 'base64'));
  return decrypted.toString('utf8');
};

// Funciones de cifrado y descifrado simétrico
const encryptSymmetric = (text) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
};

const decryptSymmetric = (encryptedText) => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Endpoint para guardar una contraseña
app.post('/guardar', async (req, res) => {
  const { description, password, encryptionType } = req.body;

  let encryptedPassword;

  if (encryptionType === 'asimetrico') {
    encryptedPassword = encryptAsymmetric(password);
  } else if (encryptionType === 'simetrico') {
    encryptedPassword = encryptSymmetric(password);
  } else {
    return res.status(400).send({ error: 'Tipo de cifrado no válido' });
  }

  try {
    const query = 'INSERT INTO passwords (description, encryption_type, password_encrypted) VALUES ($1, $2, $3) RETURNING id';
    const values = [description, encryptionType, encryptedPassword];

    const result = await pool.query(query, values);

    res.send({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Error al guardar la contraseña' });
  }
});

// Endpoint para obtener todas las contraseñas (descifradas)
app.get('/contrasenas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM passwords');

    const passwords = result.rows.map((row) => {
      let decryptedPassword;

      if (row.encryption_type === 'asimetrico') {
        decryptedPassword = decryptAsymmetric(row.password_encrypted);
      } else if (row.encryption_type === 'simetrico') {
        decryptedPassword = decryptSymmetric(row.password_encrypted);
      }

      return {
        id: row.id,
        description: row.description,
        password: decryptedPassword,
        encryptionType: row.encryption_type,
      };
    });

    res.send(passwords);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Error al obtener las contraseñas' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
