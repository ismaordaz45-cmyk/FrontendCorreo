import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Email,
  CheckCircle,
  Cancel,
  Visibility,
  ArrowBack,
} from "@mui/icons-material";

const MySwal = withReactContent(Swal);

// URL base del backend (ajustada para local; cambia si usas Render)
const API_BASE_URL = "https://backendcorreo.onrender.com";

function VerificacionCorreo() {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setVerificationCode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!verificationCode) {
      MySwal.fire({
        icon: "error",
        title: "Código requerido",
        text: "Por favor introduce el código de verificación.",
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('Enviando solicitud de verificación para el código:', verificationCode);
      await axios.get(`${API_BASE_URL}/api/registro/verify/${verificationCode}`);
      MySwal.fire({
        icon: "success",
        title: "Correo electrónico validado",
        text: "Redirigiendo al login.",
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      console.error("Error al verificar el código:", error.response ? error.response.data : error.message);
      const errorMessage = error.response?.data?.error || "Ocurrió un error al verificar el código. Por favor, intenta de nuevo.";
      if (errorMessage === "La cuenta ya está verificada. Inicia sesión para continuar.") {
        MySwal.fire({
          icon: "info",
          title: "Cuenta verificada",
          text: "Redirigiendo al login.",
        }).then(() => {
          navigate("/login");
        });
      } else {
        MySwal.fire({
          icon: "error",
          title: "Error de verificación",
          text: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: "100%" }}
      >
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <Paper
            elevation={8}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              background: "linear-gradient(145deg, #f5f7fa 0%, #c3cfe2 100%)",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)",
                color: "white",
                textAlign: "center",
                p: 4,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                }}
              />
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Email sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
              </motion.div>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Verificar Código
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Introduce el código enviado a tu correo electrónico
              </Typography>
            </Box>

            {/* Form */}
            <Box sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="medium"
                    color="text.secondary"
                    gutterBottom
                  >
                    Código de verificación (6 dígitos)
                  </Typography>
                  <TextField
                    fullWidth
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={handleChange}
                    inputProps={{
                      maxLength: 6,
                      style: {
                        textAlign: "center",
                        fontSize: "1.25rem",
                        fontFamily: "monospace",
                        letterSpacing: "0.5em",
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {verificationCode.length === 6 ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Cancel color="disabled" />
                          )}
                        </InputAdornment>
                      ),
                    }}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "background.default",
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                          boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                        },
                      },
                    }}
                    required
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    textAlign="center"
                    display="block"
                    sx={{ mt: 1 }}
                  >
                    Revisa tu bandeja de entrada o spam si no lo encuentras
                  </Typography>
                </Box>

                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  whileHover={!isLoading && verificationCode.length === 6 ? "hover" : ""}
                  whileTap="tap"
                >
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading || verificationCode.length !== 6}
                    size="large"
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      background:
                        "linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)",
                      "&:disabled": {
                        background: "grey.400",
                        color: "grey.100",
                      },
                    }}
                  >
                    {isLoading ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        <span>Verificando...</span>
                      </Box>
                    ) : (
                      "Verificar Código"
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Links */}
              <Box
                sx={{
                  textAlign: "center",
                  mt: 3,
                  pt: 3,
                  borderTop: 1,
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate("/registro")}
                  color="primary"
                  sx={{ fontWeight: "medium", fontSize: "0.875rem" }}
                >
                  ¿No recibiste el código? Reenviar
                </Link>
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate("/login")}
                  color="text.secondary"
                  sx={{
                    fontWeight: "medium",
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
                  }}
                >
                  <ArrowBack fontSize="small" />
                  Volver al Login
                </Link>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
}

export default VerificacionCorreo;