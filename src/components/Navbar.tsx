import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogIn, LogOut, User, Shield, Building2, BarChart3, Menu, Home, MessageSquareText, Star, Activity } from 'lucide-react';
import { UserRole } from '@/types/api';
import LoadingSpinner from './LoadingSpinner';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, loading } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoginPage = location.pathname === '/login';

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'US';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Shield className="h-4 w-4" />;
      case UserRole.MANAGER:
        return <Building2 className="h-4 w-4" />;
      case UserRole.SUPERVISOR:
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleText = (role?: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.MANAGER:
        return 'Manager';
      case UserRole.SUPERVISOR:
        return 'Supervisor';
      default:
        return 'Usuario';
    }
  };

  const getDashboardRoute = (role?: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.MANAGER:
        return '/manager';
      case UserRole.SUPERVISOR:
        return '/manager'; // Los supervisors también usan el panel de manager
      default:
        return '/';
    }
  };

  // Clases dinámicas basadas en la ruta
  const getLinkClasses = (isActive = false) => {
    const baseClasses = "transition-colors hover:opacity-80 flex items-center text-base font-medium";
    if (isLoginPage) {
      return `${baseClasses} text-white/80 font-light`;
    }
    return `${baseClasses} ${isActive ? 'text-gray-900' : 'text-gray-700'}`;
  };

  const getMobileLinkClasses = (isActive = false) => {
    return `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
      isActive 
        ? 'bg-siclo-deep-blue/10 text-siclo-deep-blue font-medium' 
        : 'text-slate-700 hover:bg-slate-100'
    }`;
  };

  const isCurrentPath = (path: string) => location.pathname === path;
  
  const isCurrentTab = (tabValue: string) => {
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab');
    
    // Si no hay tab específico en la URL, usar valores por defecto
    if (!currentTab) {
      if (location.pathname === '/admin' && tabValue === 'complaints') return true;
      if (location.pathname === '/manager' && tabValue === 'complaints') return true;
      return false;
    }
    
    return currentTab === tabValue;
  };

  return (
    <header className={`fixed top-0 z-50 h-16 w-full font- bg-transparent backdrop-blur border-none ${
      isLoginPage ? '' : 'shadow-lg shadow-gray-400/10'
    }`}>
      <div className="container flex h-16 items-center justify-between px-6 md:px-16">
        <div className="flex items-center space-x-12">
                               <div className="flex flex-col items-center">
            {/* Logo clickeable solo si no estamos en complaints o ratings */}
            {location.pathname !== '/complaints' && location.pathname !== '/ratings' ? (
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src="/logo.svg" 
                  alt="Siclo Logo" 
                  className={`h-6 w-auto transition-all duration-300 ${
                    isLoginPage ? 'filter brightness-0 invert' : ''
                  }`}
                />
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <img 
                  src="/logo.svg" 
                  alt="Siclo Logo" 
                  className={`h-6 w-auto transition-all duration-300 ${
                    isLoginPage ? 'filter brightness-0 invert' : ''
                  }`}
                />
              </div>
            )}
            {/* Texto pequeño debajo del logo según la pestaña */}
            {location.pathname === '/complaints' && (
              <span className={`text-xs mt-1 ${
                isLoginPage ? 'text-white/60' : 'text-gray-500'
              }`}>
                sugerencias
              </span>
            )}
            {location.pathname === '/ratings' && (
              <span className={`text-xs mt-1 ${
                isLoginPage ? 'text-white/60' : 'text-gray-500'
              }`}>
                calificaciones
              </span>
            )}
          </div>
          
          {/* Desktop Navigation - Solo para usuarios no autenticados y no en complaints/ratings */}
          <nav className="hidden md:flex items-center space-x-12 mt-1">
            {/* Navegación para usuarios no registrados - ocultar en complaints y ratings */}
            {!isAuthenticated && location.pathname !== '/complaints' && location.pathname !== '/ratings' && (
              <>
                <Link to="/" className={getLinkClasses()}>
                  Inicio
                </Link>
                <Link to="/complaints" className={getLinkClasses()}>
                  Registrar Observación
                </Link>
                <Link to="/ratings" className={getLinkClasses()}>
                  Calificar Clase
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="lg"
                  className={`p-2 ${isLoginPage ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full bg-white">
                  {/* Header */}
                  <SheetHeader className="p-6 pb-4 border-b border-slate-200">
                    <SheetTitle className="text-left text-lg font-semibold text-slate-900">
                      Sistema de reclamos y calificaciones
                    </SheetTitle>
                  </SheetHeader>
                  
                  {/* Navigation Items */}
                  <div className="flex-1 p-6 space-y-1">
                                        {/* Navegación para usuarios autenticados */}
                    {isAuthenticated ? (
                      <>
                        {/* Navegación específica para Admin */}
                        {user?.role === UserRole.ADMIN && (
                          <>
                            <button
                              onClick={() => handleNavigation('/admin?tab=complaints')}
                              className={getMobileLinkClasses(location.pathname === '/admin' && isCurrentTab('complaints'))}
                            >
                              <MessageSquareText className="h-5 w-5" />
                              <span className="text-sm">Sugerencias</span>
                            </button>
                            <button
                              onClick={() => handleNavigation('/admin?tab=ratings')}
                              className={getMobileLinkClasses(location.pathname === '/admin' && isCurrentTab('ratings'))}
                            >
                              <Star className="h-5 w-5" />
                              <span className="text-sm">Valoraciones</span>
                            </button>
                            <button
                              onClick={() => handleNavigation('/admin?tab=managers')}
                              className={getMobileLinkClasses(location.pathname === '/admin' && isCurrentTab('managers'))}
                            >
                              <User className="h-5 w-5" />
                              <span className="text-sm">Personal</span>
                            </button>
                            <button
                              onClick={() => handleNavigation('/admin?tab=instructors')}
                              className={getMobileLinkClasses(location.pathname === '/admin' && isCurrentTab('instructors'))}
                            >
                              <Shield className="h-5 w-5" />
                              <span className="text-sm">Instructores</span>
                            </button>
                            <button
                              onClick={() => handleNavigation('/admin?tab=stores')}
                              className={getMobileLinkClasses(location.pathname === '/admin' && isCurrentTab('stores'))}
                            >
                              <Building2 className="h-5 w-5" />
                              <span className="text-sm">Locales</span>
                            </button>
                            <button
                              onClick={() => handleNavigation('/admin?tab=analytics')}
                              className={getMobileLinkClasses(location.pathname === '/admin' && isCurrentTab('analytics'))}
                            >
                              <BarChart3 className="h-5 w-5" />
                              <span className="text-sm">Analíticas</span>
                            </button>
                          </>
                        )}

                        {/* Navegación específica para Manager */}
                        {user?.role === UserRole.MANAGER && (
                          <>
                            <button
                              onClick={() => handleNavigation('/manager?tab=complaints')}
                              className={getMobileLinkClasses(location.pathname === '/manager' && isCurrentTab('complaints'))}
                            >
                              <MessageSquareText className="h-5 w-5" />
                              <span className="text-sm">Sugerencias</span>
                            </button>
                            <button
                              onClick={() => handleNavigation('/manager?tab=ratings')}
                              className={getMobileLinkClasses(location.pathname === '/manager' && isCurrentTab('ratings'))}
                            >
                              <Star className="h-5 w-5" />
                              <span className="text-sm">Calificaciones</span>
                            </button>
                            <button
                              onClick={() => handleNavigation('/manager?tab=stats')}
                              className={getMobileLinkClasses(location.pathname === '/manager' && isCurrentTab('stats'))}
                            >
                              <BarChart3 className="h-5 w-5" />
                              <span className="text-sm">Estadísticas</span>
                            </button>
                          </>
                        )}

                        {/* Navegación específica para Supervisor */}
                        {user?.role === UserRole.SUPERVISOR && (
                          <>
                            <button
                              onClick={() => handleNavigation('/admin?tab=complaints')}
                              className={getMobileLinkClasses(location.pathname === '/admin' && isCurrentTab('complaints'))}
                            >
                              <MessageSquareText className="h-5 w-5" />
                              <span className="text-sm">Sugerencias</span>
                            </button>
                            <button
                              onClick={() => handleNavigation('/admin?tab=ratings')}
                              className={getMobileLinkClasses(location.pathname === '/admin' && isCurrentTab('ratings'))}
                            >
                              <Star className="h-5 w-5" />
                              <span className="text-sm">Calificaciones</span>
                            </button>
                            <button
                              onClick={() => handleNavigation('/admin?tab=analytics')}
                              className={getMobileLinkClasses(location.pathname === '/admin' && isCurrentTab('analytics'))}
                            >
                              <BarChart3 className="h-5 w-5" />
                              <span className="text-sm">Analíticas</span>
                            </button>
                          </>
                        )}

                        {/* Para otros usuarios autenticados (si los hay) */}
                        {user?.role !== UserRole.ADMIN && user?.role !== UserRole.MANAGER && user?.role !== UserRole.SUPERVISOR && (
                          <button
                            onClick={() => handleNavigation('/')}
                            className={getMobileLinkClasses(isCurrentPath('/'))}
                          >
                            <Home className="h-5 w-5" />
                            <span className="text-sm">Inicio</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Navegación para usuarios no registrados - ocultar en complaints y ratings */}
                        {location.pathname !== '/complaints' && location.pathname !== '/ratings' && (
                          <>
                            <button
                              onClick={() => handleNavigation('/')}
                              className={getMobileLinkClasses(isCurrentPath('/'))}
                            >
                              <Home className="h-5 w-5" />
                              <span className="text-sm">Inicio</span>
                            </button>
                            <button
                              onClick={() => handleNavigation('/complaints')}
                              className={getMobileLinkClasses(isCurrentPath('/complaints'))}
                            >
                              <MessageSquareText className="h-5 w-5" />
                              <span className="text-sm">Registrar Observación</span>
                            </button>
                            <button
                              onClick={() => handleNavigation('/ratings')}
                              className={getMobileLinkClasses(isCurrentPath('/ratings'))}
                            >
                              <Star className="h-5 w-5" />
                              <span className="text-sm">Calificar Clase</span>
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* User Section */}
                  <div className="p-6 border-t border-slate-200 bg-slate-50">
                    {loading ? (
                      <div className="flex items-center space-x-3 p-3">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm text-slate-600">Cargando...</span>
                      </div>
                    ) : isAuthenticated ? (
                      <div className="space-y-2">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-slate-200">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.image} alt={user?.name} />
                            <AvatarFallback className="bg-siclo-deep-blue text-white">
                              {getInitials(user?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1 mb-0.5">
                              {getRoleIcon(user?.role)}
                              <p className="text-xs font-medium text-slate-900 truncate">
                                {user?.name}
                              </p>
                            </div>
                            <p className="text-xs text-slate-600 truncate">
                              {user?.email}
                            </p>
                            <p className="text-xs text-siclo-green font-medium">
                              {getRoleText(user?.role)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Logout Button */}
                        <Button
                          onClick={handleLogout}
                          variant="outline"
                          className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Cerrar sesión
                        </Button>
                      </div>
                                         ) : (
                       // Ocultar botón de login en complaints y ratings
                       location.pathname !== '/complaints' && location.pathname !== '/ratings' && (
                         <Button 
                           onClick={() => handleNavigation('/login')}
                           className="w-full bg-gradient-to-r from-siclo-orange via-siclo-purple to-siclo-deep-blue text-white font-medium"
                         >
                           <LogIn className="h-4 w-4 mr-2" />
                           Iniciar sesión
                         </Button>
                       )
                     )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

                     {/* Desktop User Section */}
           <div className="hidden md:block">
             {loading ? (
               <div className="flex items-center space-x-2">
                 <LoadingSpinner size="sm" />
                 <span className={`text-sm ${isLoginPage ? 'text-white/70' : 'text-muted-foreground'}`}>
                   Cargando...
                 </span>
               </div>
             ) : isAuthenticated ? (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button 
                     variant="ghost" 
                     className={`relative flex items-center space-x-3 px-3 bg-gray-100/65 py-2 h-auto rounded-lg hover:bg-gray-100 transition-colors ${
                       isLoginPage ? 'text-white hover:bg-white/10' : 'text-gray-700'
                     }`}
                   >
                     <Avatar className="h-8 w-8">
                       <AvatarImage src={user?.image} alt={user?.name} />
                       <AvatarFallback className="bg-siclo-deep-blue text-white">
                         {getInitials(user?.name)}
                       </AvatarFallback>
                     </Avatar>
                     <div className="flex flex-col items-start text-left">
                       <div className="flex items-center space-x-1">
                         {getRoleIcon(user?.role)}
                         <span className={`text-sm font-medium ${
                           isLoginPage ? 'text-white' : 'text-gray-900'
                         }`}>
                           {user?.name}
                         </span>
                       </div>
                       <span className={`text-xs ${
                         isLoginPage ? 'text-white/70' : 'text-gray-500'
                       }`}>
                         {getRoleText(user?.role)}
                       </span>
                     </div>
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent className="w-56" align="end" forceMount>
                   <DropdownMenuLabel className="font-normal">
                     <div className="flex flex-col space-y-1">
                       <div className="flex items-center space-x-2">
                         {getRoleIcon(user?.role)}
                         <p className="text-sm font-medium leading-none">{user?.name}</p>
                       </div>
                       <p className="text-xs leading-none text-muted-foreground">
                         {user?.email}
                       </p>
                       <p className="text-xs leading-none text-siclo-green font-medium">
                         {getRoleText(user?.role)}
                       </p>
                     </div>
                   </DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => navigate(getDashboardRoute(user?.role))}>
                     <BarChart3 className="mr-2 h-4 w-4" />
                     <span>Mi Dashboard</span>
                   </DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={handleLogout}>
                     <LogOut className="mr-2 h-4 w-4" />
                     <span>Cerrar sesión</span>
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             ) : (
               // Ocultar botón de login en complaints y ratings
               location.pathname !== '/complaints' && location.pathname !== '/ratings' && (
                 <Button 
                   variant="outline" 
                   onClick={() => navigate('/login')}
                   className={`transition-all duration-300 ${
                     isLoginPage 
                       ? 'border-white/30 text-white/90 bg-transparent hover:bg-white hover:text-gray-900' 
                       : 'border-siclo-deep-blue bg-transparent text-siclo-deep-blue hover:bg-gradient-to-r hover:from-siclo-deep-blue hover:to-siclo-purple hover:text-white'
                   }`}
                 >
                   <LogIn className="h-4 w-4 mr-2" />
                   Iniciar sesión
                 </Button>
               )
             )}
           </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;