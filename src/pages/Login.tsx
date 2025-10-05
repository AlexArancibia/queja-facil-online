import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, LogIn } from 'lucide-react';
import { UserRole } from '@/types/api';
import LoadingSpinner from '@/components/LoadingSpinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { 
    user, 
    isAuthenticated, 
    login, 
    error,
    loading: authLoading
  } = useAuthStore();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      console.log('Usuario ya autenticado, redirigiendo...', { role: user.role });
      switch(user.role) {
        case UserRole.ADMIN:
        case UserRole.SUPERVISOR:
          navigate('/admin');
          break;
        case UserRole.MANAGER:
          navigate('/manager');
          break;
        default:
          navigate('/');
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit del formulario', { email, password });
    
    if (!email || !password) {
      console.log('Validación fallida: campos vacíos');
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log('Iniciando proceso de login...');

    try {
      console.log('Llamando a la función login...');
      await login({ email, password });
      
      console.log('Login exitoso');
      toast({
        title: "Inicio de sesión exitoso",
        description: "Redirigiendo al panel correspondiente...",
      });
      
    } catch (error) {
      console.error('Error en el login:', error);
      toast({
        title: "Error de autenticación",
        description: error.message || "Credenciales incorrectas",
        variant: "destructive"
      });
    } finally {
      console.log('Finalizando proceso de login');
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras se inicializa la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[url('/banner.webp')] bg-cover bg-center bg-no-repeat relative">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Verificando sesión..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('/banner.webp')] bg-cover bg-center bg-no-repeat relative ">
      {/* Overlay with blur effect */}
      <div className="absolute inset-0 bg-black/40  "></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          {/* <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button> */}

          {/* Glass effect card */}
          <Card className="shadow-2xl backdrop-blur-lg bg-gray-900/20 border border-white/20 text-white">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto bg-white/20 backdrop-blur-sm w-14 h-14 rounded-full flex items-center justify-center border border-white/30">
                <LogIn className="h-6 w-6 text-white" />
              </div>
              <div>
              <CardTitle className="text-2xl font-bold ">
  Iniciar Sesión
</CardTitle>
                <CardDescription className="text-white/80">
                  Ingresa tus credenciales para acceder al sistema
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 bg-red-500/20 backdrop-blur-sm text-red-100 rounded-md text-sm border border-red-400/30">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      console.log('Email cambiado:', e.target.value);
                      setEmail(e.target.value);
                    }}
                    placeholder="tu@email.com"
                    required
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/50 focus-visible:border-white/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/90">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      console.log('Contraseña cambiada');
                      setPassword(e.target.value);
                    }}
                    placeholder="••••••••"
                    required
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/50 focus-visible:border-white/50"
                  />
                </div>

                <Button 
  type="submit" 
  className="w-full bg-gradient-to-r from-siclo-yellow via-siclo-orange via-siclo-purple to-siclo-deep-blue border-0 text-white transition-all duration-300 shadow-sm shadow-siclo-deep-blue/30 hover:shadow-md hover:shadow-siclo-purple/40  " 
  disabled={isLoading}
>
  {isLoading ? (
    <span className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      Iniciando sesión...
    </span>
  ) : (
    <span className="flex items-center gap-2">
      <LogIn className="h-4 w-4" />
      Iniciar Sesión
    </span>
  )}
</Button>
              </form>

 
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;