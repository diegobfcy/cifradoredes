import React, { useState } from "react";
import axios from "axios";
import {
  Form,
  Button,
  InputGroup,
  FormControl,
  Container,
} from "react-bootstrap";
import { Link } from 'react-router-dom';
function RegisterEmpresa() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    personalData: {
      nombre: "",
      email: "",
      telefono: "",
      direccion: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name in formData.personalData) {
      setFormData({
        ...formData,
        personalData: {
          ...formData.personalData,
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      username: formData.username,
      password: formData.password,
      userType: "empresa",
      personalData: formData.personalData,
    };

    try {
      const response = await axios.post(
        "http://localhost:3009/register",
        dataToSend
      );
      alert("Registro de empresa exitoso");
      // Redirigir al login o a la página principal
    } catch (error) {
      console.error(error);
      alert("Error al registrar la empresa");
    }
  };

  return (
    <div
      style={{ backgroundColor: "#ffba6a", padding: "50px 0", height: "100vh" }}
    >
      <Container
        style={{
          maxWidth: "600px",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "15px",
          boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Registro de Empresa</h2>
        <Form onSubmit={handleSubmit}>
          <InputGroup className="mb-3">
            <InputGroup.Text>Nombre de Usuario</InputGroup.Text>
            <FormControl
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>Contraseña</InputGroup.Text>
            <FormControl
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>Nombre de la Empresa</InputGroup.Text>
            <FormControl
              type="text"
              name="nombre"
              placeholder="Nombre de la empresa"
              value={formData.personalData.nombre}
              onChange={handleChange}
              required
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>Correo Electrónico</InputGroup.Text>
            <FormControl
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.personalData.email}
              onChange={handleChange}
              required
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>Teléfono</InputGroup.Text>
            <FormControl
              type="text"
              name="telefono"
              placeholder="Teléfono"
              value={formData.personalData.telefono}
              onChange={handleChange}
              required
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>Dirección</InputGroup.Text>
            <FormControl
              type="text"
              name="direccion"
              placeholder="Dirección"
              value={formData.personalData.direccion}
              onChange={handleChange}
              required
            />
          </InputGroup>
          <div className="mt-3">
            <Link to="/login" className="btn btn-link">
              ¿Ya tienes una cuenta? Inicia sesión
            </Link>
          </div>
          <Button variant="primary" type="submit">
            Registrar Empresa
          </Button>
        </Form>
      </Container>
    </div>
  );
}

export default RegisterEmpresa;
