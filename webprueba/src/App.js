import React, { useState } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [symmetricResponse, setSymmetricResponse] = useState(null);
  const [asymmetricResponse, setAsymmetricResponse] = useState(null);

  const handleSymmetricEncryption = async () => {
    try {
      const response = await fetch(`http://localhost:3009/simetrico/${encodeURIComponent(inputText)}`);
      const data = await response.json();
      setSymmetricResponse(data);
    } catch (error) {
      console.error('Error al llamar a la API simétrica:', error);
    }
  };

  const handleAsymmetricEncryption = async () => {
    try {
      const response = await fetch(`http://localhost:3008/asimetrico/${encodeURIComponent(inputText)}`);
      const data = await response.json();
      setAsymmetricResponse(data);
    } catch (error) {
      console.error('Error al llamar a la API asimétrica:', error);
    }
  };

  return (
    <div className="App">
      <h1>Prueba de Cifrado</h1>
      <input
        type="text"
        placeholder="Ingresa el texto a cifrar"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <div>
        <button onClick={handleSymmetricEncryption}>Cifrado Simétrico</button>
        <button onClick={handleAsymmetricEncryption}>Cifrado Asimétrico</button>
      </div>
      {symmetricResponse && (
        <div>
          <h2>Resultado Cifrado Simétrico:</h2>
          <p><strong>Original:</strong> {symmetricResponse.original}</p>
          <p><strong>Encriptado:</strong> {symmetricResponse.encrypted}</p>
          <p><strong>Desencriptado:</strong> {symmetricResponse.decrypted}</p>
        </div>
      )}
      {asymmetricResponse && (
        <div>
          <h2>Resultado Cifrado Asimétrico:</h2>
          <p><strong>Original:</strong> {asymmetricResponse.original}</p>
          <p><strong>Encriptado:</strong> {asymmetricResponse.encrypted}</p>
          <p><strong>Desencriptado:</strong> {asymmetricResponse.decrypted}</p>
        </div>
      )}
    </div>
  );
}

export default App;
