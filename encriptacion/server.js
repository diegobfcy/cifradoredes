const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(bodyParser.json()); 
const PORT = 3009;

const pool = new Pool({
  user: 'postgres',       
  host: 'localhost',
  database: 'foraneofit',
  password: 'root', 
  port: 5432,
});

const algorithm = 'aes-256-cbc'; 
const secretKey = crypto.createHash('sha256').update(String('mi_clave_secreta')).digest('base64').substr(0, 32);
const iv = Buffer.alloc(16, 0); 

const publicKey = fs.readFileSync('public_key.pem', 'utf8');
const privateKey = fs.readFileSync('private_key.pem', 'utf8');

const encryptAsymmetric = (text) => {
  const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(text));
  return encrypted.toString('base64');
};

const decryptAsymmetric = (encryptedText) => {
  const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(encryptedText, 'base64'));
  return decrypted.toString('utf8');
};

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
app.post('/register', async (req, res) => {
    const { username, password, userType, personalData } = req.body;
  
    const userExists = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).send({ error: 'El nombre de usuario ya está en uso' });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    let encryptedPersonalData;
    if (userType === 'empresa') {
      encryptedPersonalData = encryptAsymmetric(JSON.stringify(personalData));
    } else if (userType === 'personal') {
      encryptedPersonalData = encryptSymmetric(JSON.stringify(personalData));
    } else {
      return res.status(400).send({ error: 'Tipo de usuario no válido' });
    }
  
    try {
      const query = 'INSERT INTO users (username, password, user_type, personal_data) VALUES ($1, $2, $3, $4) RETURNING id';
      const values = [username, hashedPassword, userType, encryptedPersonalData];
  
      const result = await pool.query(query, values);
  
      res.send({ success: true, id: result.rows[0].id });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error al registrar el usuario' });
    }
  });

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  
      if (result.rows.length === 0) {
        return res.status(400).send({ error: 'Usuario no encontrado' });
      }
  
      const user = result.rows[0];
  
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).send({ error: 'Contraseña incorrecta' });
      }
  
      let decryptedPersonalData;
      if (user.user_type === 'empresa') {
        decryptedPersonalData = decryptAsymmetric(user.personal_data);
      } else if (user.user_type === 'personal') {
        decryptedPersonalData = decryptSymmetric(user.personal_data);
      }
  
      res.send({
        id: user.id,
        username: user.username,
        userType: user.user_type,
        personalData: JSON.parse(decryptedPersonalData),
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error al iniciar sesión' });
    }
  });

app.post('/places', async (req, res) => {
    const { userId, name, address, description, encryptedData, coordinates } = req.body;
  
    try {
      const userResult = await pool.query('SELECT user_type FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0 || userResult.rows[0].user_type !== 'empresa') {
        return res.status(403).send({ error: 'No autorizado' });
      }
  
      const encryptedPlaceData = encryptAsymmetric(JSON.stringify(encryptedData));
  
      const query = 'INSERT INTO places (name, address, description, company_id, encrypted_data, coordinates) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
      const values = [name, address, description, userId, encryptedPlaceData, coordinates];
  
      const result = await pool.query(query, values);
  
      res.send({ success: true, id: result.rows[0].id });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error al crear el lugar' });
    }
  });
  

app.get('/places', async (req, res) => {
    try {
      const result = await pool.query('SELECT id, name, address, description,coordinates FROM places');
      res.send(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error al obtener los lugares' });
    }
  });
app.get('/places/:id', async (req, res) => {
    const placeId = req.params.id;
  
    try {
      const result = await pool.query('SELECT * FROM places WHERE id = $1', [placeId]);
  
      if (result.rows.length === 0) {
        return res.status(404).send({ error: 'Lugar no encontrado' });
      }
  
      const place = result.rows[0];
  
      res.send({
        id: place.id,
        name: place.name,
        address: place.address,
        description: place.description,
        coordinates: place.coordinates 
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error al obtener el lugar' });
    }
  });
  

app.post('/recommendations', async (req, res) => {
    const { userId, placeId, note } = req.body;
  
    try {
      const userResult = await pool.query('SELECT user_type FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0 || userResult.rows[0].user_type !== 'personal') {
        return res.status(403).send({ error: 'No autorizado' });
      }
  
      const query = 'INSERT INTO recommendations (user_id, place_id, note) VALUES ($1, $2, $3) RETURNING id';
      const values = [userId, placeId, note];
  
      const result = await pool.query(query, values);
  
      res.send({ success: true, id: result.rows[0].id });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error al agregar la recomendación' });
    }
  });

app.get('/users/:id/recommendations', async (req, res) => {
    const userId = req.params.id;
  
    try {
      const query = `
        SELECT r.id, r.note, p.name, p.address
        FROM recommendations r
        JOIN places p ON r.place_id = p.id
        WHERE r.user_id = $1
      `;
      const values = [userId];
  
      const result = await pool.query(query, values);
  
      res.send(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error al obtener las recomendaciones' });
    }
  });

  

app.post('/reviews', async (req, res) => {
    const { userId, placeId, rating, comment } = req.body;
  
    try {
      
      const userResult = await pool.query('SELECT user_type FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0 || userResult.rows[0].user_type !== 'personal') {
        return res.status(403).send({ error: 'No autorizado' });
      }
  
      const query = 'INSERT INTO reviews (user_id, place_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING id';
      const values = [userId, placeId, rating, comment];
  
      const result = await pool.query(query, values);
  
      res.send({ success: true, id: result.rows[0].id });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error al agregar la reseña' });
    }
  });


app.get('/places/:id/reviews', async (req, res) => {
    const placeId = req.params.id;
  
    try {
      const query = `
        SELECT r.id, r.rating, r.comment, u.username
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.place_id = $1
      `;
      const values = [placeId];
  
      const result = await pool.query(query, values);
  
      res.send(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error al obtener las reseñas' });
    }
  });
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });

  