const express = require('express');
const crypto = require('crypto');
const cors = require('cors');



const app = express();
app.use(cors());
const PORT = 3008;

const fs = require('fs');

const publicKey = fs.readFileSync('public_key.pem', 'utf8');
const privateKey = fs.readFileSync('private_key.pem', 'utf8');

const encryptAsymmetric = (text) => {
  const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(text));
  return encrypted.toString('hex');
};

const decryptAsymmetric = (encryptedText) => {
  const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(encryptedText, 'hex'));
  return decrypted.toString('utf8');
};

app.get('/asimetrico/:text', (req, res) => {
  const text = req.params.text;
  const encrypted = encryptAsymmetric(text);
  const decrypted = decryptAsymmetric(encrypted);

  res.send({
    original: text,
    encrypted,
    decrypted
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

//IMPORTANTE
//generacion de claves publica y privada
//openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
//openssl rsa -pubout -in private_key.pem -out public_key.pem
