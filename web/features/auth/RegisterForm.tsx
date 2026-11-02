"use client";

import { Mail, Lock, Eye, AlertCircle, Loader2, User, Building2, Phone, MapPin, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "./api";
import { ApiError, RegisterRequest, RegisterOrganizationData } from "./types";

export default function RegisterForm() {
  const router = useRouter();
  
  // Estados base
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Consumer");
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para Organización
  const [orgName, setOrgName] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgVerification, setOrgVerification] = useState("");

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    setIsLoading(true);

    let organizationData: RegisterOrganizationData | null = null;
    
    if (role === "Organization") {
      organizationData = {
        name: orgName,
        contactPhone: orgPhone,
        address: orgAddress,
        verificationInformation: orgVerification || undefined,
      };
    }

    const payload: RegisterRequest = {
      displayName,
      email,
      password,
      role,
      organization: organizationData,
    };

    try {
      await register(payload);
      setSuccess(true);
      // El registro no inicia sesión automáticamente según el backend
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.code === "VALIDATION_ERROR" && apiError.errors) {
        setFieldErrors(apiError.errors);
      } else {
        setGeneralError(apiError.message || "Ocurrió un error al registrar la cuenta.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (field: string) => {
    return fieldErrors[field] ? fieldErrors[field][0] : null;
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-10 border border-gray-100 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cuenta creada!</h2>
        <p className="text-gray-600 mb-6">
          Tu registro se completó con éxito. {role === "Organization" && "Tu organización está pendiente de verificación."} Serás redirigido al inicio de sesión.
        </p>
        <Link href="/login" className="text-[#5B7A38] font-medium hover:underline">
          Ir al inicio de sesión manualmente
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm p-10 border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Crear cuenta</h2>
        <p className="text-gray-500 mt-2">Únete a XFood y aprovechemos los alimentos.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {generalError && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{generalError}</p>
          </div>
        )}

        {/* Selección de Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">¿Cómo deseas usar XFood?</label>
          <div className="grid grid-cols-3 gap-3">
            {["Consumer", "Establishment", "Organization"].map((r) => (
              <label 
                key={r} 
                className={`cursor-pointer border rounded-xl p-3 text-center transition-colors ${role === r ? 'border-[#5B7A38] bg-green-50 text-[#2C3F20] font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value={r} 
                  checked={role === r} 
                  onChange={(e) => setRole(e.target.value)} 
                  className="sr-only" 
                />
                <span className="text-sm">
                  {r === "Consumer" ? "Consumidor" : r === "Establishment" ? "Negocio" : "Organización"}
                </span>
              </label>
            ))}
          </div>
          {getFieldError("role") && <p className="text-red-500 text-xs mt-1">{getFieldError("role")}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
                className={`block w-full pl-10 pr-3 py-2.5 border ${getFieldError("displayName") ? 'border-red-300' : 'border-gray-200'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B7A38]`}
                required
                disabled={isLoading}
              />
            </div>
            {getFieldError("displayName") && <p className="text-red-500 text-xs mt-1">{getFieldError("displayName")}</p>}
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className={`block w-full pl-10 pr-3 py-2.5 border ${getFieldError("email") ? 'border-red-300' : 'border-gray-200'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B7A38]`}
                required
                disabled={isLoading}
              />
            </div>
            {getFieldError("email") && <p className="text-red-500 text-xs mt-1">{getFieldError("email")}</p>}
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crea una contraseña segura"
              className={`block w-full pl-10 pr-10 py-2.5 border ${getFieldError("password") ? 'border-red-300' : 'border-gray-200'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B7A38]`}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
          {getFieldError("password") && <p className="text-red-500 text-xs mt-1">{getFieldError("password")}</p>}
        </div>

        {/* Campos condicionales para Organización */}
        {role === "Organization" && (
          <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Datos de la Organización
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre de la organización</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Building2 className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7A38]"
                    required={role === "Organization"}
                    disabled={isLoading}
                  />
                </div>
                {getFieldError("organization.name") && <p className="text-red-500 text-xs mt-1">{getFieldError("organization.name")}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono de contacto</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={orgPhone}
                    onChange={(e) => setOrgPhone(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7A38]"
                    required={role === "Organization"}
                    disabled={isLoading}
                  />
                </div>
                {getFieldError("organization.contactPhone") && <p className="text-red-500 text-xs mt-1">{getFieldError("organization.contactPhone")}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Dirección</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={orgAddress}
                  onChange={(e) => setOrgAddress(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7A38]"
                  required={role === "Organization"}
                  disabled={isLoading}
                />
              </div>
              {getFieldError("organization.address") && <p className="text-red-500 text-xs mt-1">{getFieldError("organization.address")}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Información de verificación (Opcional)</label>
              <div className="relative">
                <div className="absolute top-2 left-2.5 pointer-events-none">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <textarea
                  value={orgVerification}
                  onChange={(e) => setOrgVerification(e.target.value)}
                  rows={2}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7A38]"
                  disabled={isLoading}
                />
              </div>
              {getFieldError("organization.verificationInformation") && <p className="text-red-500 text-xs mt-1">{getFieldError("organization.verificationInformation")}</p>}
            </div>
          </div>
        )}

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 bg-[#2C3F20] hover:bg-[#3d562d] disabled:opacity-70 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-xl font-medium transition-colors mt-2"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>Registrarse <span aria-hidden="true">&rarr;</span></>
          )}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-[#5B7A38] hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}