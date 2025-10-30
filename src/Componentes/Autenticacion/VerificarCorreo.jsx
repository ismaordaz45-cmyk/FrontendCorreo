import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { MailIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline';

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
        background: '#fef2f2',
        iconColor: '#ef4444'
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
        background: '#f0fdf4',
        iconColor: '#22c55e'
      }).then(() => {
        navigate("/login"); // Redirección después de cerrar la alerta
      });
    } catch (error) {
      console.error("Error al verificar el código:", error.response ? error.response.data : error.message);
      const errorMessage = error.response?.data?.error || "Ocurrió un error al verificar el código. Por favor, intenta de nuevo.";
      if (errorMessage === "La cuenta ya está verificada. Inicia sesión para continuar.") {
        MySwal.fire({
          icon: "info",
          title: "Cuenta verificada",
          text: "Redirigiendo al login.",
          background: '#eff6ff',
          iconColor: '#3b82f6'
        }).then(() => {
          navigate("/login"); // Redirige al login después de cerrar la alerta
        });
      } else {
        MySwal.fire({
          icon: "error",
          title: "Error de verificación",
          text: errorMessage,
          background: '#fef2f2',
          iconColor: '#ef4444'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
          {/* Header with icon */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative z-10">
              <MailIcon className="mx-auto h-16 w-16 mb-4 opacity-90" />
              <h1 className="text-3xl font-bold mb-2">Verificar Código</h1>
              <p className="text-blue-100 text-sm opacity-90">
                Introduce el código enviado a tu correo electrónico
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Código de verificación (6 dígitos)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="000000"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={handleChange}
                    maxLength={6}
                    className="w-full px-4 py-4 text-center text-lg font-mono tracking-widest border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50"
                    required
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <CheckCircleIcon className={`h-5 w-5 ${verificationCode.length === 6 ? 'text-green-500' : 'text-gray-300'}`} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Revisa tu bandeja de entrada o spam si no lo encuentras
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className={`w-full flex items-center justify-center py-4 px-6 font-semibold rounded-xl transition-all duration-300 transform ${
                  isLoading || verificationCode.length !== 6
                    ? 'bg-gray-400 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                } text-white focus:outline-none focus:ring-4 focus:ring-blue-300`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verificando...</span>
                  </div>
                ) : (
                  <span>Verificar Código</span>
                )}
              </button>
            </form>

            {/* Resend link or back */}
            <div className="text-center space-y-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => navigate("/registro")}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 text-sm"
              >
                ¿No recibiste el código? Reenviar
              </button>
              <button
                onClick={() => navigate("/login")}
                className="text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200 text-sm"
              >
                Volver al Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificacionCorreo;