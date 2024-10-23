const express = require('express');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = 3009;

const algorithm = 'aes-256-cbc'; 
const secretKey = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decrypt = (encryptedText) => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

app.get('/simetrico/:text', (req, res) => {
  const text = req.params.text;
  const encrypted = encrypt(text);
  const decrypted = decrypt(encrypted);
  
  res.send({
    original: text,
    encrypted,
    decrypted
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
