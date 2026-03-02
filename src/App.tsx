import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from './icons';

// --- Types ---
type View = 'home' | 'register' | 'admin' | 'schedule' | 'login';

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'declined';
  tag: 'Urgent' | 'Routine';
  icon: any;
  notes?: string;
}

interface ServiceDef {
  id: string;
  titleKey: 'plumbing' | 'electrical' | 'carpentry' | 'painting';
  price: string;
  img: string;
  icon: any;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
}

// The one email that grants admin access
const ADMIN_EMAIL = 'admin@maintenco.com';

type Language = 'en' | 'es';

const translations = {
  en: {
    brand: 'MaintenCo',
    home: 'Home',
    schedule: 'Schedule',
    register: 'Register',
    admin: 'Admin',
    signin: 'Sign In',
    logout: 'Logout',
    welcome: 'Professional Maintenance for Your Home',
    welcomeSub: 'Book reliable experts for plumbing, electrical, and more in seconds.',
    requestAppt: 'Request Appointment',
    ourServices: 'Our Services',
    exploreServices: 'Explore our specialized maintenance experts',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    phone: 'Phone Number',
    required: 'Required',
    next: 'Next',
    back: 'Back',
    welcomeBack: 'Welcome Back',
    signinSub: 'Sign in with your email to access your maintenance plan.',
    noAccount: "Don't have an account?",
    registerNow: 'Register now',
    hasAccount: 'Already have an account?',
    registerTitle: 'Create Account',
    registerSub: 'Please provide your contact information to start your residential maintenance plan.',
    adminTitle: 'Admin Dashboard',
    pendingAppts: 'Pending Appointments',
    accepted: 'Accepted',
    declined: 'Declined',
    accept: 'Accept',
    decline: 'Decline',
    urgent: 'Urgent',
    routine: 'Routine',
    selectService: 'Select Service',
    servicePlaceholder: 'What do you need help with?',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    confirmAppt: 'Confirm Appointment',
    apptSuccess: 'Appointment Scheduled!',
    support: 'Support',
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    carpentry: 'Carpentry',
    painting: 'Painting',
    plumbingDesc: 'Pipe repairs, leaks, and installations.',
    electricalDesc: 'Wiring, fixtures, and safety checks.',
    carpentryDesc: 'Furniture repair and woodwork.',
    paintingDesc: 'Interior and exterior professional painting.',
    serviceSuccess: 'Appointment created successfully',
    estimatedDuration: 'Estimated duration',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    booked: 'Booked',
    status: 'Status',
    viewAll: 'View All',
    from: 'From',
    appointments: 'Appointments',
    pending: 'Pending',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    notes: 'Notes',
    manageServices: 'Manage Services',
    price: 'Price',
    updatePrice: 'Update Price'
  },
  es: {
    brand: 'MaintenCo',
    home: 'Inicio',
    schedule: 'Citas',
    register: 'Registro',
    admin: 'Admin',
    signin: 'Entrar',
    logout: 'Salir',
    welcome: 'Mantenimiento Profesional para tu Hogar',
    welcomeSub: 'Reserva expertos confiables para plomería, electricidad y más en segundos.',
    requestAppt: 'Solicitar Cita',
    ourServices: 'Nuestros Servicios',
    exploreServices: 'Explora nuestros expertos en mantenimiento especializado',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo Electrónico',
    phone: 'Teléfono',
    required: 'Obligatorio',
    next: 'Siguiente',
    back: 'Atrás',
    welcomeBack: 'Bienvenido de nuevo',
    signinSub: 'Inicia sesión con tu email para acceder a tu plan de mantenimiento.',
    noAccount: '¿No tienes cuenta?',
    registerNow: 'Regístrate ahora',
    hasAccount: '¿Ya tienes cuenta?',
    registerTitle: 'Crear Cuenta',
    registerSub: 'Por favor, proporciona tu información de contacto para iniciar tu plan.',
    adminTitle: 'Panel de Administración',
    pendingAppts: 'Citas Pendientes',
    accepted: 'Aceptadas',
    declined: 'Rechazadas',
    accept: 'Aceptar',
    decline: 'Rechazar',
    urgent: 'Urgente',
    routine: 'Rutina',
    selectService: 'Seleccionar Servicio',
    servicePlaceholder: '¿Con qué necesitas ayuda?',
    selectDate: 'Seleccionar Fecha',
    selectTime: 'Seleccionar Hora',
    confirmAppt: 'Confirmar Cita',
    apptSuccess: '¡Cita Programada!',
    support: 'Soporte',
    plumbing: 'Plomería',
    electrical: 'Electricidad',
    carpentry: 'Carpintería',
    painting: 'Pintura',
    plumbingDesc: 'Reparación de tuberías, fugas e instalaciones.',
    electricalDesc: 'Cableado, accesorios y revisiones de seguridad.',
    carpentryDesc: 'Reparación de muebles y trabajos en madera.',
    paintingDesc: 'Pintura profesional interior y exterior.',
    serviceSuccess: 'Cita creada exitosamente',
    estimatedDuration: 'Duración estimada',
    morning: 'Mañana',
    afternoon: 'Tarde',
    evening: 'Noche',
    booked: 'Reservado',
    status: 'Estado',
    viewAll: 'Ver Todo',
    from: 'Desde',
    appointments: 'Citas',
    pending: 'En espera',
    edit: 'Editar',
    save: 'Guardar',
    cancel: 'Cancelar',
    notes: 'Notas',
    manageServices: 'Gestionar Servicios',
    price: 'Precio',
    updatePrice: 'Actualizar Precio'
  }
};

// --- Components ---

const Header = ({ title, onBack, showActions = true, t }: { title: string; onBack?: () => void; showActions?: boolean; t: (k: keyof typeof translations['en']) => string }) => (
  <header className="flex items-center bg-white px-4 py-3 sticky top-0 z-50 border-b border-slate-200 justify-between">
    <div className="flex items-center gap-2">
      {onBack ? (
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
          <Icons.ArrowLeft className="w-6 h-6 text-slate-900" />
        </button>
      ) : (
        <Icons.Wrench className="w-6 h-6 text-primary" />
      )}
      <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">{title}</h2>
    </div>
    {showActions && (
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <Icons.Bell className="w-5 h-5 text-slate-600" />
        </button>
      </div>
    )}
  </header>
);

const Navbar = ({
  currentView,
  setView,
  user,
  onLogout,
  language,
  onLanguageSwitch,
  t
}: {
  currentView: View;
  setView: (v: View) => void;
  user: User | null;
  onLogout: () => void;
  language: Language;
  onLanguageSwitch: () => void;
  t: (k: keyof typeof translations['en']) => string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleNavClick = (v: View) => {
    if (v === 'schedule' && !user) {
      setView('register');
    } else {
      setView(v);
    }
    setIsOpen(false);
    setProfileOpen(false);
  };

  const allMenuItems: { id: View; label: string; icon: React.FC<any> }[] = [
    { id: 'home', label: t('home'), icon: Icons.HomeIcon },
    { id: 'schedule', label: t('schedule'), icon: Icons.Calendar },
    { id: 'register', label: t('register'), icon: Icons.PlusCircle },
    { id: 'admin', label: t('admin'), icon: Icons.LayoutDashboard },
  ];

  // Show admin only to admin-role users
  const menuItems = user?.role === 'admin'
    ? allMenuItems
    : allMenuItems.filter(item => item.id !== 'admin');

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('home')}>
            <Icons.Wrench className="w-8 h-8 text-primary" />
            <span className="text-xl font-black text-slate-900 tracking-tighter">{t('brand')}</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-bold uppercase tracking-wider transition-colors hover:text-primary ${currentView === item.id ? 'text-primary' : 'text-slate-600'
                  }`}
              >
                {item.label}
              </button>
            ))}
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <button
                onClick={onLanguageSwitch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black leading-none text-slate-400">LANG</span>
                  <span className="text-xs font-bold text-primary">{language.toUpperCase()}</span>
                </div>
              </button>

              <Icons.Bell className="w-5 h-5 text-slate-600 cursor-pointer" />
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10 hover:bg-primary/10 transition-all"
                  >
                    <Icons.UserCircle className="w-5 h-5 text-primary" />
                    <span className="text-xs font-bold text-slate-900">{user.firstName}</span>
                    <Icons.ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${profileOpen ? 'rotate-90' : 'rotate-0'}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-[150]" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 z-[200] overflow-hidden">
                        {/* User Info Header */}
                        <div className="px-4 py-4 bg-primary/5 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Icons.UserCircle className="w-6 h-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        {/* Actions */}
                        <div className="p-2">
                          <button
                            onClick={() => handleNavClick('schedule')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-sm font-medium"
                          >
                            <Icons.Calendar className="w-4 h-4 text-primary" />
                            <span>{t('schedule')}</span>
                          </button>
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            onClick={() => { onLogout(); setProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all text-sm font-medium"
                          >
                            <Icons.LogOut className="w-4 h-4" />
                            <span>{t('logout')}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Icons.UserCircle className="w-5 h-5 text-slate-600 cursor-pointer" onClick={() => handleNavClick('register')} />
              )}
            </div>
          </div>

          {/* Mobile Menu Button - Top Right */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={onLanguageSwitch}
              className="text-xs font-black text-primary border border-primary/20 bg-primary/5 px-2 py-1 rounded-md"
            >
              {language.toUpperCase()}
            </button>
            {user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 rounded-lg border border-primary/10">
                  <span className="text-[10px] font-black text-primary uppercase">{user.firstName}</span>
                </div>
                <button onClick={onLogout} className="text-slate-400">
                  <Icons.LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <Icons.X className="w-6 h-6" /> : <Icons.Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (3-line menu collapsed) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[-1]"
            />
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="absolute top-[65px] left-0 right-0 bg-white shadow-2xl border-b border-slate-100 flex flex-col p-6 z-[101]"
            >
              <div className="flex flex-col gap-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${currentView === item.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-base font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Views ---

const HomeView = ({ onSchedule, services, t }: {
  onSchedule: () => void;
  services: ServiceDef[];
  t: (k: keyof typeof translations['en']) => string;
  key?: string
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-24"
    >

      <main>
        <div className="p-4">
          <div className="relative min-h-[420px] flex flex-col gap-6 rounded-2xl overflow-hidden px-6 pb-10 pt-20 justify-end shadow-xl">
            <div className="absolute inset-0 z-0">
              <img
                alt="Professional cleaner"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEYgXSerWmgz1H3vvx8VtqySkm9zoQxQ2Whfpa6TJ20W-JvLg0DlC9qS0sy2FH8OBwiVomAvhtRl685SY9GrCw73jh6J7a7qG0Bbtmcrxn2CLWWkBS0Uy--RgYyVGxcAqEI6_6b6UM87vjWVhslhb5-WjDZyHyHk1yRDi8vlqWkjbQPFpuTD8DvZh6bcJW_XgmNnEkHkU1awfF_V0ujLhG9Qv-xcN2_8UPnCMLYZHpXaXo4PA0Zvto6gP5XTA8A4MY_F8RSp07qHoA"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            </div>
            <div className="relative z-10 flex flex-col gap-3">
              <h1 className="text-white text-3xl font-black leading-tight tracking-tight">
                {t('welcome')}
              </h1>
              <p className="text-slate-200 text-sm font-medium leading-relaxed max-w-[280px]">
                {t('welcomeSub')}
              </p>
              <button
                onClick={onSchedule}
                className="mt-4 flex w-fit items-center justify-center rounded-xl h-12 px-8 bg-primary text-white text-base font-bold shadow-lg shadow-primary/30 active:scale-95 transition-transform"
              >
                {t('requestAppt')}
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900 text-xl font-extrabold tracking-tight">{t('ourServices')}</h2>
            <button className="text-primary text-sm font-semibold">{t('viewAll')}</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {services.map((service) => (
              <div key={service.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:border-primary/50 transition-all cursor-pointer group hover:shadow-md" onClick={onSchedule}>
                <div className="h-56 w-full overflow-hidden relative">
                  <img src={service.img} alt={t(service.titleKey)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 backdrop-blur shadow-sm text-primary">
                    <service.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-slate-900 text-base font-bold">{t(service.titleKey)}</h3>
                  <p className="text-slate-500 text-xs mt-1">{t('from')} <span className="font-bold text-slate-700">{service.price}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 py-12 text-center text-slate-500">
          <p className="text-sm">{t('exploreServices')}</p>
        </div>
      </main>
    </motion.div>
  );
};

const LoginView = ({ onLogin, onSwitchToRegister, t }: { onLogin: (email: string) => void; onSwitchToRegister: () => void; t: (k: keyof typeof translations['en']) => string; key?: string }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onLogin(email);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="pb-24 min-h-screen bg-white"
    >
      <div className="flex items-center px-4 pt-6 pb-2 justify-between">
        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors" onClick={onSwitchToRegister}>
          <Icons.ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">{t('signin')}</h2>
      </div>

      <div className="px-6 mt-12">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900 mb-2">{t('welcomeBack')}</h1>
          <p className="text-slate-500 text-sm">{t('signinSub')}</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">{t('email')}</label>
            <input
              className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="example@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <span>{t('signin')}</span>
            <Icons.ChevronRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            {t('noAccount')}{' '}
            <button onClick={onSwitchToRegister} className="text-primary font-bold hover:underline">
              {t('registerNow')}
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const RegisterView = ({ onRegister, onSwitchToLogin, t }: { onRegister: (user: User) => void; onSwitchToLogin: () => void; t: (k: keyof typeof translations['en']) => string; key?: string }) => {
  const [formData, setFormData] = useState<User>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName && formData.email) {
      onRegister(formData);
    } else {
      alert(t('required'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-24 min-h-screen bg-white"
    >
      <div className="flex items-center px-4 pt-6 pb-2 justify-between">
        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors" onClick={() => window.history.back()}>
          <Icons.ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">{t('register')}</h2>
      </div>

      <div className="px-6 mt-12">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900 mb-2">{t('registerTitle')}</h1>
          <p className="text-slate-600 text-sm mb-8">{t('registerSub')}</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-semibold text-slate-700">{t('firstName')}</label>
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">{t('required')}</span>
            </div>
            <div className="relative">
              <input
                className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="example"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-semibold text-slate-700">{t('lastName')}</label>
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">{t('required')}</span>
            </div>
            <div className="relative">
              <input
                className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="example"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-semibold text-slate-700">{t('email')}</label>
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">{t('required')}</span>
            </div>
            <div className="relative">
              <input
                className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="example@email.com"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">{t('phone')}</label>
            <div className="relative">
              <input
                className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="+1 (555) 000-0000"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-10 mb-20">
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>{t('next')}: {t('schedule')}</span>
              <Icons.ChevronRight className="w-5 h-5" />
            </button>
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                {t('hasAccount')}{' '}
                <button onClick={onSwitchToLogin} className="text-primary font-bold hover:underline">
                  {t('signin')}
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const AdminView = ({
  appointments,
  services,
  onAccept,
  onDecline,
  onEdit,
  onUpdateService,
  t
}: {
  appointments: Appointment[];
  services: ServiceDef[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onEdit: (id: string, updated: Partial<Appointment>) => void;
  onUpdateService: (id: string, updated: Partial<ServiceDef>) => void;
  t: (k: keyof typeof translations['en']) => string;
  key?: string;
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Appointment> | null>(null);

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const acceptedCount = appointments.filter(a => a.status === 'accepted').length;
  const declinedCount = appointments.filter(a => a.status === 'declined').length;

  const startEdit = (appt: Appointment) => {
    setEditingId(appt.id);
    setEditForm({ ...appt });
  };

  const handleSave = () => {
    if (editingId && editForm) {
      onEdit(editingId, editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const servicesList = [
    { label: t('plumbing'), icon: Icons.Droplets },
    { label: t('electrical'), icon: Icons.Zap },
    { label: t('carpentry'), icon: Icons.Hammer },
    { label: t('painting'), icon: Icons.Paintbrush },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-24"
    >
      <main className="p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('pendingAppts'), val: pendingCount.toString(), trend: '+5%', up: true },
            { label: t('accepted'), val: acceptedCount.toString(), trend: '-2%', up: false },
            { label: t('declined'), val: declinedCount.toString(), trend: '0%', up: null },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-1 rounded-xl p-4 bg-white shadow-sm border border-slate-100">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-slate-900 text-2xl font-bold leading-tight">{stat.val}</p>
              <div className={`flex items-center gap-1 text-xs font-semibold ${stat.up === true ? 'text-emerald-600' : stat.up === false ? 'text-rose-600' : 'text-slate-400'}`}>
                {stat.up === true ? <Icons.TrendingUp className="w-3 h-3" /> : stat.up === false ? <Icons.TrendingDown className="w-3 h-3" /> : <Icons.Minus className="w-3 h-3" />}
                <span>{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Manage Services */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900 text-lg font-bold">{t('manageServices')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((svc) => (
              <div key={svc.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <svc.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t(svc.titleKey as any)}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                    <input
                      type="text"
                      defaultValue={svc.price.replace('$', '')}
                      onBlur={(e) => {
                        const newPrice = `$${e.target.value}`;
                        if (newPrice !== svc.price) {
                          onUpdateService(svc.id, { price: newPrice });
                        }
                      }}
                      className="w-24 pl-6 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900 text-lg font-bold">{t('appointments')}</h3>
          </div>

          {appointments.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <req.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{req.service}</h4>
                    <p className="text-slate-500 text-xs">{req.clientName} • {req.date} {req.time}</p>
                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'declined' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 ${req.tag === 'Urgent' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} text-[10px] font-bold uppercase rounded`}>
                    {req.tag === 'Urgent' ? t('urgent') : t('routine')}
                  </span>
                  <button
                    onClick={() => startEdit(req)}
                    className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-primary transition-colors"
                  >
                    <Icons.Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {req.status === 'pending' && (
                <div className="flex gap-2 pt-2 border-t border-slate-50">
                  <button
                    onClick={() => onAccept(req.id)}
                    className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Icons.Check className="w-4 h-4" /> {t('accept')}
                  </button>
                  <button
                    onClick={() => onDecline(req.id)}
                    className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Icons.X className="w-4 h-4" /> {t('decline')}
                  </button>
                </div>
              )}
            </div>
          ))}

          {appointments.length === 0 && (
            <div className="text-center py-10">
              <Icons.Inbox className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">{t('noAccount') === "Don't have an account?" ? 'No appointments found' : 'No se encontraron citas'}</p>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal/Panel */}
      <AnimatePresence>
        {editingId && editForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingId(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white rounded-t-[32px] shadow-2xl z-[201] overflow-y-auto"
            >
              <div className="p-6 pb-12 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900">{t('edit')}</h3>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 rounded-full bg-slate-100 text-slate-400"
                  >
                    <Icons.X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Service Selector in Edit */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('selectService')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {servicesList.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setEditForm({ ...editForm, service: s.label, icon: s.icon })}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${editForm.service === s.label
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-100 text-slate-600 hover:border-slate-200'
                            }`}
                        >
                          <s.icon className="w-5 h-5" />
                          <span className="text-sm font-bold">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tag/Priority */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('status')}</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditForm({ ...editForm, tag: 'Routine' })}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${editForm.tag === 'Routine'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-slate-100 text-slate-400'
                          }`}
                      >
                        {t('routine')}
                      </button>
                      <button
                        onClick={() => setEditForm({ ...editForm, tag: 'Urgent' })}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${editForm.tag === 'Urgent'
                          ? 'border-amber-500 bg-amber-50 text-amber-600'
                          : 'border-slate-100 text-slate-400'
                          }`}
                      >
                        {t('urgent')}
                      </button>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('selectDate')}</label>
                      <input
                        type="text"
                        value={editForm.date || ''}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-full p-3 rounded-xl border-2 border-slate-100 text-sm font-bold focus:border-primary outline-none transition-all"
                        placeholder="e.g. Mar 5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('selectTime')}</label>
                      <input
                        type="text"
                        value={editForm.time || ''}
                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                        className="w-full p-3 rounded-xl border-2 border-slate-100 text-sm font-bold focus:border-primary outline-none transition-all"
                        placeholder="e.g. 09:00 AM"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('notes')}</label>
                    <textarea
                      value={editForm.notes || ''}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      className="w-full p-3 rounded-xl border-2 border-slate-100 text-sm font-medium focus:border-primary outline-none transition-all min-h-[100px]"
                      placeholder="..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold transition-all active:scale-95"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-4 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/25 transition-all active:scale-95"
                  >
                    {t('save')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ScheduleView = ({ onSchedule, appointments, services, t }: {
  onSchedule: (appt: Omit<Appointment, 'id' | 'status'>) => void;
  appointments: Appointment[];
  services: ServiceDef[];
  t: (k: keyof typeof translations['en']) => string;
  key?: string;
}) => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth(); // 0-indexed
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[currentMonth];
  const monthNameShort = monthName.slice(0, 3); // e.g. "Mar"

  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [selectedTime, setSelectedTime] = useState('09:00 AM');
  const [selectedTag, setSelectedTag] = useState<'Routine' | 'Urgent'>('Routine');
  const [selectedService, setSelectedService] = useState(0);

  // Determine the state of each time slot based on existing appointments
  const getSlotStatus = (time: string): 'available' | 'pending' | 'booked' => {
    const appt = appointments.find(
      a => a.time === time && a.date === `${monthNameShort} ${selectedDay}`
    );
    if (!appt) return 'available';
    if (appt.status === 'accepted') return 'booked';
    if (appt.status === 'pending') return 'pending';
    return 'available'; // declined slots become available again
  };

  const timeSlots = [
    { time: '09:00 AM', period: t('morning') },
    { time: '10:30 AM', period: t('morning') },
    { time: '01:00 PM', period: t('afternoon') },
    { time: '02:30 PM', period: t('afternoon') },
    { time: '04:00 PM', period: t('evening') },
    { time: '05:30 PM', period: t('evening') },
  ];

  const SelectedIcon = services[selectedService].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-24 bg-[#f6f6f8] min-h-screen"
    >


      {/* Service selector */}
      <div className="px-4 mb-4">
        <h3 className="text-lg font-bold tracking-tight mb-3">{t('selectService')}</h3>
        <div className="grid grid-cols-4 gap-2">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <button
                key={i}
                onClick={() => setSelectedService(i)}
                className={`flex flex-col items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all
                  ${selectedService === i
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-primary/50'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-tight leading-none">{t(svc.titleKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Routine / Urgent toggle */}
      <div className="px-4 mb-4">
        <h3 className="text-lg font-bold tracking-tight mb-3">{t('urgent')} / {t('routine')}</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedTag('Routine')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-bold transition-all
              ${selectedTag === 'Routine'
                ? 'bg-blue-50 border-blue-400 text-blue-600'
                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
          >
            <Icons.Clock className="w-4 h-4" />
            {t('routine')}
          </button>
          <button
            onClick={() => setSelectedTag('Urgent')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-bold transition-all
              ${selectedTag === 'Urgent'
                ? 'bg-amber-50 border-amber-400 text-amber-600'
                : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300'}`}
          >
            <Icons.Zap className="w-4 h-4" />
            {t('urgent')}
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight">{t('selectDate')}</h3>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{monthName.toUpperCase()} {currentYear}</span>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="grid grid-cols-7 mb-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <p key={d} className="text-slate-400 text-xs font-bold text-center">{d}</p>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for the weekday offset of the 1st */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const isSelected = selectedDay === day;
              const isPast = day < currentDay;
              return (
                <button
                  key={day}
                  disabled={isPast}
                  onClick={() => setSelectedDay(day)}
                  className={`h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all
                    ${isSelected ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30' :
                      isPast ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-700'}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 px-4 space-y-4">
        <h3 className="text-lg font-bold tracking-tight">{t('selectTime')}</h3>
        <div className="grid grid-cols-3 gap-3">
          {timeSlots.map((slot, i) => {
            const slotStatus = getSlotStatus(slot.time);
            const isSelected = selectedTime === slot.time;
            const isBooked = slotStatus === 'booked';
            const isPending = slotStatus === 'pending';
            return (
              <button
                key={i}
                disabled={isBooked || isPending}
                onClick={() => setSelectedTime(slot.time)}
                className={`flex flex-col items-center justify-center py-4 rounded-2xl transition-all border-2
                  ${isBooked
                    ? 'bg-rose-50 border-rose-200 cursor-not-allowed opacity-70'
                    : isPending
                      ? 'bg-amber-50 border-amber-300 cursor-not-allowed'
                      : isSelected
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-white border-slate-200 hover:border-primary/50'}`}
              >
                <span className={`text-sm font-bold ${isBooked ? 'text-rose-400' : isPending ? 'text-amber-500' : ''
                  }`}>{slot.time}</span>
                <span className="text-[10px] font-medium opacity-70">
                  {isBooked
                    ? t('booked')
                    : isPending
                      ? t('pending')
                      : slot.period}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10 p-4 pb-12 space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('status')}</span>
            <span className={`text-sm font-bold flex items-center gap-1 ${selectedTag === 'Urgent' ? 'text-amber-500' : 'text-blue-500'}`}>
              {selectedTag === 'Urgent' ? <Icons.Zap className="w-4 h-4" /> : <Icons.Clock className="w-4 h-4" />}
              {selectedTag === 'Urgent' ? t('urgent') : t('routine')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('schedule')}</span>
            <p className="text-sm font-bold">{monthNameShort} {selectedDay} • {selectedTime}</p>
            <p className="text-xs text-slate-500">{t(services[selectedService].titleKey)}</p>
          </div>
        </div>
        <button
          onClick={() => onSchedule({
            clientName: 'Example Client',
            service: t(services[selectedService].titleKey),
            date: `${monthNameShort} ${selectedDay}`,
            time: selectedTime,
            tag: selectedTag,
            icon: services[selectedService].icon
          })}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/25 active:scale-95 transition-all"
        >
          {t('confirmAppt')}
        </button>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('home');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mainten_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('mainten_lang');
    return (saved as Language) || 'en';
  });

  const [services, setServices] = useState<ServiceDef[]>([
    { id: '1', titleKey: 'plumbing', price: '$89/hr', img: "/images/plumbing.png", icon: Icons.Droplets },
    { id: '2', titleKey: 'carpentry', price: '$75/hr', img: "/images/carpentry.png", icon: Icons.Hammer },
    { id: '3', titleKey: 'painting', price: '$65/hr', img: "/images/painting.png", icon: Icons.Paintbrush },
    { id: '4', titleKey: 'electrical', price: '$95/hr', img: "/images/electrical.png", icon: Icons.Zap },
  ]);

  // Redirect non-admin users away from admin view
  useEffect(() => {
    if (user?.role !== 'admin' && view === 'admin') {
      setView('home');
    }
  }, [user, view]);

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key];
  };

  const handleLanguageSwitch = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
    localStorage.setItem('mainten_lang', newLang);
  };

  const addAppointment = (appt: Omit<Appointment, 'id' | 'status'>) => {
    const newAppt: Appointment = {
      ...appt,
      clientName: user ? `${user.firstName} ${user.lastName}` : appt.clientName,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    };
    setAppointments([newAppt, ...appointments]);
    setView('admin'); // Navigate to admin to see it
  };

  const handleRegister = (userData: User) => {
    const role = userData.email === ADMIN_EMAIL ? 'admin' : 'user';
    const userWithRole = { ...userData, role } as User;
    setUser(userWithRole);
    localStorage.setItem('mainten_user', JSON.stringify(userWithRole));
    setView('schedule');
  };

  const handleLogin = (email: string) => {
    const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
    // Try to retrieve a previously registered user
    const savedUser = localStorage.getItem('mainten_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.email === email) {
        const updatedUser = { ...parsed, role: isAdmin ? 'admin' : 'user' } as User;
        setUser(updatedUser);
        localStorage.setItem('mainten_user', JSON.stringify(updatedUser));
        setView(isAdmin ? 'admin' : 'schedule');
        return;
      }
    }
    // Admin login even without prior registration
    if (isAdmin) {
      const adminUser: User = { firstName: 'Admin', lastName: 'MaintenCo', email, phone: '', role: 'admin' };
      setUser(adminUser);
      localStorage.setItem('mainten_user', JSON.stringify(adminUser));
      setView('admin');
      return;
    }
    // Regular user fallback
    const newUser: User = { firstName: 'Returning', lastName: 'User', email, phone: '', role: 'user' };
    setUser(newUser);
    setView('schedule');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mainten_user');
    setView('home');
  };

  const handleScheduleClick = () => {
    if (user) {
      setView('schedule');
    } else {
      setView('register');
    }
  };

  const updateAppointmentStatus = (id: string, status: 'accepted' | 'declined') => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleEditAppointment = (id: string, updated: Partial<Appointment>) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, ...updated } : a));
  };

  const handleUpdateService = (id: string, updated: Partial<ServiceDef>) => {
    setServices(services.map(s => s.id === id ? { ...s, ...updated } : s));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] pt-16 relative">
      <Navbar
        currentView={view}
        setView={setView}
        user={user}
        onLogout={handleLogout}
        language={language}
        onLanguageSwitch={handleLanguageSwitch}
        t={t}
      />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {view === 'home' && <HomeView key="home" onSchedule={handleScheduleClick} services={services} t={t} />}
            {view === 'register' && (
              <RegisterView
                key="register"
                onRegister={handleRegister}
                onSwitchToLogin={() => setView('login')}
                t={t}
              />
            )}
            {view === 'login' && (
              <LoginView
                key="login"
                onLogin={handleLogin}
                onSwitchToRegister={() => setView('register')}
                t={t}
              />
            )}
            {view === 'admin' && (
              <AdminView
                key="admin"
                appointments={appointments}
                services={services}
                onAccept={(id) => updateAppointmentStatus(id, 'accepted')}
                onDecline={(id) => updateAppointmentStatus(id, 'declined')}
                onEdit={handleEditAppointment}
                onUpdateService={handleUpdateService}
                t={t}
              />
            )}
            {view === 'schedule' && (
              <ScheduleView
                key="schedule"
                onSchedule={addAppointment}
                appointments={appointments}
                services={services}
                t={t}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="bg-slate-900 text-white mt-12 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex flex-col gap-4 max-w-sm">
            <div className="flex items-center gap-2">
              <Icons.Wrench className="w-8 h-8 text-primary" />
              <span className="text-2xl font-black tracking-tighter">{t('brand')}</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t('welcomeSub')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-slate-100 uppercase text-xs tracking-widest">{t('ourServices')}</h4>
              <nav className="flex flex-col gap-3 text-sm text-slate-400">
                <button className="text-left hover:text-white transition-colors">{t('plumbing')}</button>
                <button className="text-left hover:text-white transition-colors">{t('electrical')}</button>
                <button className="text-left hover:text-white transition-colors">{t('carpentry')}</button>
                <button className="text-left hover:text-white transition-colors">{t('painting')}</button>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-slate-100 uppercase text-xs tracking-widest">{t('brand')}</h4>
              <nav className="flex flex-col gap-3 text-sm text-slate-400">
                <button className="text-left hover:text-white transition-colors">{t('home')}</button>
                <button className="text-left hover:text-white transition-colors" onClick={() => setView('schedule')}>{t('schedule')}</button>
                <button className="text-left hover:text-white transition-colors" onClick={() => setView('admin')}>{t('admin')}</button>
              </nav>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
          <p className="text-slate-500 text-xs">
            Â© 2026 {t('brand')} Inc. {language === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
          </p>
          <div className="flex items-center gap-6">
            <Icons.Facebook className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer transition-colors" />
            <Icons.Twitter className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer transition-colors" />
            <Icons.Instagram className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>

      {/* Support Button (Desktop/Mobile) */}
      <div className="fixed bottom-8 right-8 z-50">
        <a
          href="https://wa.me/12025550147"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-4 bg-primary text-white rounded-2xl shadow-2xl hover:bg-slate-900 hover:shadow-primary/20 transition-all active:scale-95 group"
          title={t('support')}
        >
          <Icons.MessageCircle className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
}
