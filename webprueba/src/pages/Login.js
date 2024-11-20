import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, InputGroup, FormControl, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [userType, setUserType] = useState('personal'); // 'personal' o 'empresa'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const navigate = useNavigate(); // Hook para redirigir

  const handleSegmentChange = (type) => {
    setUserType(type);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      username: formData.username,
      password: formData.password,
      userType: userType,
    };

    try {
      const response = await axios.post('http://localhost:3009/login', dataToSend);
      alert('Inicio de sesión exitoso');
      // Guardar datos del usuario y redirigir a /main
      navigate('/main');
    } catch (error) {
      console.error(error);
      alert('Error al iniciar sesión');
    }
  };

  return (
    <div style={{ backgroundColor: '#ffba6a', padding: '50px 0', height: "100vh" }}>
      <Container style={{ maxWidth: '500px', backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)' }}>
        <h2>ForaneoFit</h2>
        <div className="btn-group" role="group">
          <Button
            onClick={() => handleSegmentChange('personal')}
            variant={userType === 'personal' ? 'primary' : 'secondary'}
          >
            Personal
          </Button>
          <Button
            onClick={() => handleSegmentChange('empresa')}
            variant={userType === 'empresa' ? 'primary' : 'secondary'}
          >
            Empresa
          </Button>
        </div>
        <Form onSubmit={handleSubmit} className="mt-3">
          <InputGroup className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-default">Usuario</InputGroup.Text>
            <FormControl
              aria-label="Username"
              aria-describedby="inputGroup-sizing-default"
              name="username"
              placeholder="Nombre de usuario"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-default">Contraseña</InputGroup.Text>
            <FormControl
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </InputGroup>
          <div>
            <Link to="/register" className="btn btn-link">¿No tienes una cuenta? Regístrate</Link>
            <Link to="/register-empresa" className="btn btn-link">¿No tienes una cuenta de empresa? Regístrate como empresa</Link>
          </div>
          <Button type="submit" variant="success">Iniciar Sesión</Button>
        </Form>
      </Container>
    </div>
  );
}

export default Login;
