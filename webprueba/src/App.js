import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Table, Alert } from 'react-bootstrap';

function App() {
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [encryptionType, setEncryptionType] = useState('simetrico');
  const [passwords, setPasswords] = useState([]);
  const [message, setMessage] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});

  useEffect(() => {
    cargarContrasenas();
  }, []);

  const cargarContrasenas = async () => {
    try {
      const response = await axios.get('http://localhost:3009/contrasenas');
      setPasswords(response.data);
    } catch (error) {
      console.error('Error al cargar las contraseñas', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !password) {
      setMessage('Por favor, completa todos los campos.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3009/guardar', {
        description,
        password,
        encryptionType,
      });

      if (response.data.success) {
        setMessage('Contraseña guardada con éxito.');
        setDescription('');
        setPassword('');
        setEncryptionType('simetrico');
        cargarContrasenas();
      } else {
        setMessage('Error al guardar la contraseña.');
      }
    } catch (error) {
      console.error('Error al guardar la contraseña', error);
      setMessage('Error al guardar la contraseña.');
    }
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  return (
    <Container>
      <h1 className="mt-4">Gestor de Contraseñas</h1>
      {message && <Alert variant="info">{message}</Alert>}
      <Form onSubmit={handleSubmit} className="mt-4">
        <Form.Group controlId="description">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            placeholder="Introduce una descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Introduce la contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="encryptionType">
          <Form.Label>Tipo de Cifrado</Form.Label>
          <Form.Control
            as="select"
            value={encryptionType}
            onChange={(e) => setEncryptionType(e.target.value)}
            required
          >
            <option value="simetrico">Simétrico</option>
            <option value="asimetrico">Asimétrico</option>
          </Form.Control>
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3">
          Guardar Contraseña
        </Button>
      </Form>

      <h2 className="mt-5">Contraseñas Guardadas</h2>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descripción</th>
            <th>Contraseña</th>
            <th>Tipo de Cifrado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {passwords.map((pw) => (
            <tr key={pw.id}>
              <td>{pw.id}</td>
              <td>{pw.description}</td>
              <td>
                {visiblePasswords[pw.id] ? pw.password : '••••••••'}
              </td>
              <td>{pw.encryptionType}</td>
              <td>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => togglePasswordVisibility(pw.id)}
                >
                  {visiblePasswords[pw.id] ? 'Ocultar' : 'Mostrar'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default App;
