"use client";

import { Mail, Lock, Eye, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "./api";
import { ApiError } from "./types";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const account = await login({ email, password });
      
      // Redirección basada en el rol del usuario
      if (account.role === "Establishment") {
        router.push("/panel");
      } else {
        router.push("/ofertas"); // O la ruta de inicio de consumidores
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-10 border border-gray-100">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Bienvenido a XFood</h2>
        <p className="text-gray-500 mt-2">Aprovechemos los alimentos juntos.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mensaje de Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Campo Correo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo electrónico"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B7A38] focus:border-transparent transition-colors"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Campo Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B7A38] focus:border-transparent transition-colors"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              disabled={isLoading}
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
          <div className="flex justify-end mt-2">
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 bg-[#2C3F20] hover:bg-[#3d562d] disabled:opacity-70 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-xl font-medium transition-colors"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>Iniciar sesión <span aria-hidden="true">&rarr;</span></>
          )}
        </button>

        {/* Separador y Link a Registro */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">o</span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">¿Aún no tienes una cuenta?</p>
            <Link 
              href="/register" 
              className={`w-full flex justify-center items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3.5 px-4 rounded-xl font-medium transition-colors ${isLoading ? 'pointer-events-none opacity-70' : ''}`}
            >
              Crear cuenta <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}