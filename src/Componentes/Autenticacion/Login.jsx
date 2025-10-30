import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { useAuth } from '../Autenticacion/AuthContext';

// Material UI Components
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Security,
  ArrowBack,
  PersonAdd,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const MySwal = withReactContent(Swal);
const API_BASE_URL = "https://backendcorreo.onrender.com";

// Motion Components
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);
const MotionBox = motion(Box);

function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    correo: "",
    password: "",
    userId: "",
    mfaCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();

  useEffect(() => {
    console.log('🚀 Componente Login montado');
    console.log('📍 Ubicación actual:', window.location.pathname);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log('\n═══════════════════════════════════════');
    console.log('📝 PASO 1: ENVIANDO CREDENCIALES');
    console.log('═══════════════════════════════════════');

    if (!formData.correo || !formData.password) {
      MySwal.fire({
        icon: "error",
        title: "Campos requeridos",
        text: "Ingresa tu correo y contraseña.",
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('📤 Enviando a:', `${API_BASE_URL}/api/login`);
      console.log('📧 Correo:', formData.correo);
      
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        correo: formData.correo,
        password: formData.password,
      });

      console.log('📥 Respuesta recibida:', response.data);

      if (response.data.userId) {
        console.log('✅ UserId recibido:', response.data.userId);
        setFormData((prev) => ({ ...prev, userId: response.data.userId }));
        setStep(2);
        console.log('🔄 Avanzando a paso 2 (MFA)');
        
        MySwal.fire({
          icon: "info",
          title: "Código enviado",
          text: "Revisa tu email para el código de verificación.",
        });
      }
    } catch (error) {
      console.error("❌ Error en login:", error);
      console.error("Detalles:", error.response?.data);
      
      const errorMsg = error.response?.data?.error || "Error al iniciar sesión.";
      setError(errorMsg);
      
      MySwal.fire({
        icon: "error",
        title: "Error de login",
        text: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFASubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log('\n═══════════════════════════════════════');
    console.log('🔐 PASO 2: VERIFICANDO MFA');
    console.log('═══════════════════════════════════════');

    if (!formData.mfaCode || formData.mfaCode.length !== 6) {
      MySwal.fire({
        icon: "error",
        title: "Código inválido",
        text: "Ingresa un código de 6 dígitos.",
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('📤 Enviando verificación MFA');
      console.log('👤 UserID:', formData.userId);
      console.log('🔢 Código:', formData.mfaCode);
      console.log('📍 URL:', `${API_BASE_URL}/api/login/verify-mfa`);

      const response = await axios.post(`${API_BASE_URL}/api/login/verify-mfa`, {
        userId: formData.userId,
        mfaCode: formData.mfaCode,
      });

      console.log('📥 RESPUESTA COMPLETA DEL SERVIDOR:');
      console.log(JSON.stringify(response.data, null, 2));

      if (response.data.token && response.data.user) {
        const { token, user } = response.data;
        
        console.log('\n✅ AUTENTICACIÓN EXITOSA');
        console.log('═══════════════════════════════════════');
        console.log('👤 Usuario:', user.nombre);
        console.log('📧 Correo:', user.correo);
        console.log('🎯 Tipo:', user.tipo);
        console.log('🎫 Token:', token.substring(0, 20) + '...');
        console.log('═══════════════════════════════════════');

        // 1. Guardar en localStorage
        console.log('💾 Guardando en localStorage...');
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        console.log('✅ Datos guardados en localStorage');
        
        // Verificar que se guardó correctamente
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        console.log('🔍 Verificando localStorage:');
        console.log('  - Token guardado:', storedToken ? '✅' : '❌');
        console.log('  - User guardado:', storedUser ? '✅' : '❌');

        // 2. Actualizar contexto
        console.log('🔄 Actualizando contexto Auth...');
        authLogin(user, token);
        console.log('✅ Contexto actualizado');

        // 3. Determinar ruta - usar TipoUsuario o tipo
        const userType = user.TipoUsuario || user.tipo;
        let redirectPath = "/";

        console.log('\n🧭 DETERMINANDO REDIRECCIÓN');
        console.log('═══════════════════════════════════════');
        console.log('📋 Usuario completo:', user);
        console.log('🎯 TipoUsuario:', user.TipoUsuario);
        console.log('🎯 tipo:', user.tipo);
        console.log('✅ Tipo final usado:', userType);
        console.log('🔍 Comparando con casos...');

        switch (userType) {
          case "Cliente":
            redirectPath = "/cliente";
            console.log('✅ Coincide con "Cliente" → /cliente');
            break;
          case "Repartidor":
            redirectPath = "/repartidor";
            console.log('✅ Coincide con "Repartidor" → /repartidor');
            break;
          case "Administrador":
            redirectPath = "/admin";
            console.log('✅ Coincide con "Administrador" → /admin');
            break;
          default:
            console.warn('⚠️ NO COINCIDE CON NINGÚN CASO');
            console.warn('Tipo recibido:', `"${userType}"`);
            console.warn('Tipo de dato:', typeof userType);
            console.warn('Longitud:', userType?.length);
            redirectPath = "/";
        }

        console.log('🎯 Ruta final determinada:', redirectPath);
        console.log('═══════════════════════════════════════');

        // 4. Mostrar alerta de éxito
        console.log('🎨 Mostrando alerta de éxito...');
        
        await MySwal.fire({
          icon: "success",
          title: "¡Bienvenido!",
          html: `<p>Sesión iniciada como <strong>${userType}</strong></p><p>Redirigiendo a: <strong>${redirectPath}</strong></p>`,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          willClose: () => {
            console.log('🔔 Alerta cerrada, ejecutando redirección...');
          }
        });

        // 5. REDIRECCIÓN
        console.log('\n🚀 EJECUTANDO REDIRECCIÓN');
        console.log('═══════════════════════════════════════');
        console.log('📍 Ubicación actual:', window.location.pathname);
        console.log('🎯 Navegando a:', redirectPath);
        
        // Usar window.location como fallback
        console.log('🔄 Método 1: Usando navigate()...');
        navigate(redirectPath, { replace: true });
        
        // Fallback después de 500ms
        setTimeout(() => {
          if (window.location.pathname !== redirectPath) {
            console.warn('⚠️ navigate() no funcionó, usando window.location...');
            window.location.href = redirectPath;
          } else {
            console.log('✅ Redirección exitosa');
          }
        }, 500);

        console.log('═══════════════════════════════════════\n');
        
      } else {
        console.error('❌ Respuesta incompleta del servidor');
        console.error('Token presente:', !!response.data.token);
        console.error('User presente:', !!response.data.user);
        throw new Error("Datos incompletos en la respuesta del servidor");
      }
    } catch (error) {
      console.error('\n❌ ERROR EN VERIFICACIÓN MFA');
      console.error('═══════════════════════════════════════');
      console.error('Error completo:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      console.error('═══════════════════════════════════════\n');
      
      const errorMsg = error.response?.data?.error || "Código MFA inválido.";
      setError(errorMsg);
      
      MySwal.fire({
        icon: "error",
        title: "Error de verificación",
        text: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    console.log('🔙 Volviendo al paso 1');
    setStep(1);
    setFormData({ correo: "", password: "", userId: "", mfaCode: "" });
    setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const steps = ['Credenciales', 'Verificación'];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2
      }}
    >
      <Container component="main" maxWidth="sm">
        <MotionPaper
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          elevation={8}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'white',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              py: 6,
              textAlign: 'center',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255,255,255,0.1)',
              }}
            />
            <MotionBox
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              sx={{ position: 'relative', zIndex: 1 }}
            >
              {step === 1 ? (
                <Security sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
              ) : (
                <Email sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
              )}
              <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                {step === 1 ? "Iniciar Sesión" : "Verificar Código"}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {step === 1
                  ? "Ingresa tus credenciales para continuar"
                  : "Introduce el código de 6 dígitos enviado a tu email"
                }
              </Typography>
            </MotionBox>
          </Box>

          {/* Content */}
          <Box sx={{ p: 6 }}>
            <Stepper activeStep={step - 1} sx={{ mb: 6 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <MotionBox
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleLoginSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <TextField
                        fullWidth
                        label="Correo Electrónico"
                        name="correo"
                        type="email"
                        value={formData.correo}
                        onChange={handleChange}
                        placeholder="tu@correo.com"
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Contraseña"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Tu contraseña"
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={togglePasswordVisibility}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        sx={{
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 4
                          },
                          '&:disabled': {
                            background: 'grey.400'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isLoading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={24} color="inherit" />
                            <span>Iniciando...</span>
                          </Box>
                        ) : (
                          'Iniciar Sesión'
                        )}
                      </Button>
                    </Box>
                  </form>
                </MotionBox>
              ) : (
                <MotionBox
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleMFASubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                          Código de Verificación (6 dígitos)
                        </Typography>
                        <TextField
                          fullWidth
                          placeholder="123456"
                          name="mfaCode"
                          value={formData.mfaCode}
                          onChange={handleChange}
                          inputProps={{
                            maxLength: 6,
                            style: { 
                              textAlign: 'center', 
                              fontSize: '1.5rem',
                              letterSpacing: '0.5em',
                              fontFamily: 'monospace'
                            }
                          }}
                          onKeyPress={(e) => {
                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: 'grey.50',
                              '&.Mui-focused': {
                                bgcolor: 'white',
                              }
                            }
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                          Revisa tu bandeja de entrada o spam. Válido por 10 minutos.
                        </Typography>
                      </Box>

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isLoading || formData.mfaCode.length !== 6}
                        sx={{
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 4
                          },
                          '&:disabled': {
                            background: 'grey.400'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isLoading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={24} color="inherit" />
                            <span>Verificando...</span>
                          </Box>
                        ) : (
                          'Confirmar Código'
                        )}
                      </Button>

                      <Button
                        startIcon={<ArrowBack />}
                        onClick={goBack}
                        variant="outlined"
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 'bold'
                        }}
                      >
                        Volver a credenciales
                      </Button>
                    </Box>
                  </form>
                </MotionBox>
              )}
            </AnimatePresence>

            {/* Footer Links */}
            <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                ¿No tienes cuenta?{" "}
                <Button
                  onClick={() => navigate("/registro")}
                  startIcon={<PersonAdd />}
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'primary.main'
                  }}
                >
                  Regístrate aquí
                </Button>
              </Typography>
            </Box>
          </Box>
        </MotionPaper>
      </Container>
    </Box>
  );
}

export default Login;