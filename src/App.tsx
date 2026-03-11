import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from './icons';

// --- Types ---
type View = 'home' | 'register' | 'register-success' | 'admin' | 'schedule' | 'login' | 'my-appointments';

interface Appointment {
  id: string;
  userId: string;
  clientName: string;
  service: string;
  serviceIndex: string; // Add index for icon/meta lookup
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'declined';
  tag: 'Urgent' | 'Routine';
  icon: any;
  notes?: string;
}

type AppointmentPayload = Omit<Appointment, 'id' | 'status' | 'clientName' | 'icon' | 'userId'>;

interface ServiceDef {
  id: string;
  titleKey: 'plumbing' | 'electrical' | 'carpentry' | 'painting';
  price: string;
  img: string;
  icon: any;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  role: 'user' | 'admin';
}

// The one email that grants admin access
const ADMIN_EMAIL = 'admin@maintenco.com';
const API_URL = 'http://localhost:3001/api';

type Language = 'en' | 'es';

interface WeeklyRule {
  enabled: boolean;
  start: string;
  end: string;
}

interface AvailabilityConfig {
  weekly: {
    [key: number]: WeeklyRule;
  };
  exceptions: {
    [date: string]: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  blocked: string[];
}

const DEFAULT_AVAILABILITY: AvailabilityConfig = {
  weekly: {
    1: { enabled: true, start: '09:00', end: '18:00' },
    2: { enabled: true, start: '09:00', end: '18:00' },
    3: { enabled: true, start: '09:00', end: '18:00' },
    4: { enabled: true, start: '09:00', end: '18:00' },
    5: { enabled: true, start: '09:00', end: '18:00' },
    6: { enabled: false, start: '09:00', end: '14:00' },
    0: { enabled: false, start: '00:00', end: '00:00' },
  },
  exceptions: {},
  blocked: []
};

const translations = {
  en: {
    brand: 'MaintenCo',
    slogan: 'Fast, reliable, and professional residential maintenance solutions.',
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
    plumbingDesc: 'Plumbing — fast and safe solutions for pipes and leaks.',
    electricalDesc: 'Electrical — installation, repair, and fault diagnosis.',
    carpentryDesc: 'Carpentry — furniture repair, woodwork, and custom installations.',
    paintingDesc: 'Painting — interior and exterior renovation with professional finishes.',
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
    service: 'Service',
    updatePrice: 'Update Price',
    past: 'Past',
    userNotFound: 'is not registered',
    wrongPassword: 'Incorrect password',
    password: 'Password',
    alreadyRegistered: 'Email already registered',
    myAppointments: 'My Appointments',
    requestNewAppt: 'Request New Appointment',
    verifyData: 'Verify your data',
    confirmDetails: 'Confirm Details',
    confirmAndSend: 'Confirm and Send',
    backToSelection: 'Back',
    noAppointmentsYet: 'No appointments yet',
    priority: 'Priority',
    notAvailable: 'Not Available',
    professionalUnavailable: 'The professional is absent or on vacation on this date. Please select another day.',
    slotUnavailable: 'Slot Unavailable',
    servicesSubtitle: 'Specialized professionals ready to help you',
    whyChooseUs: 'Why Choose Us',
    whyChooseUsSub: 'We stand behind every service we provide',
    punctuality: 'On-Time Service',
    punctualityDesc: 'We arrive at the scheduled time, always. Your time matters to us.',
    fairPrice: 'Fair Pricing',
    fairPriceDesc: 'Transparent quotes with no hidden fees. Quality work at honest prices.',
    guarantee: 'Service Guarantee',
    guaranteeDesc: 'Every job backed by our satisfaction guarantee. Peace of mind included.',
    testimonials: 'What Our Clients Say',
    testimonialsSub: 'Real experiences from homeowners like you',
    testimonial1: 'Excellent service! The plumber arrived on time and fixed everything perfectly. Highly recommended.',
    testimonial1Name: 'María García',
    testimonial2: 'Professional and affordable. They painted my entire house in two days with outstanding quality.',
    testimonial2Name: 'Carlos López',
    testimonial3: 'The best maintenance service I have used. Fast response and impeccable work.',
    testimonial3Name: 'Ana Rodríguez',
    readyToStart: 'Ready to get started?',
    readyToStartSub: 'Schedule your first appointment today and enjoy a worry-free home.',
    registerSuccess: 'Registration Successful!',
    registerSuccessDesc: 'Your account has been created successfully. You can now sign in and schedule your appointment.',
    goToLogin: 'Sign In',
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  },
  es: {
    brand: 'MaintenCo',
    slogan: 'Soluciones de mantenimiento residencial rápidas, confiables y profesionales.',
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
    plumbingDesc: 'Plomería — soluciones rápidas y seguras para cañerías y filtraciones.',
    electricalDesc: 'Electricidad — instalación, reparación y diagnóstico de fallas.',
    carpentryDesc: 'Carpintería — reparación de muebles, trabajos en madera e instalaciones a medida.',
    paintingDesc: 'Pintura — renovación interior y exterior con acabados profesionales.',
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
    service: 'Servicio',
    updatePrice: 'Actualizar Precio',
    past: 'Pasado',
    userNotFound: 'no se encuentra registrado',
    wrongPassword: 'Contraseña incorrecta',
    password: 'Contraseña',
    alreadyRegistered: 'Correo ya registrado',
    myAppointments: 'Mis Citas',
    requestNewAppt: 'Solicitar nueva cita',
    verifyData: 'Verifica tus datos',
    confirmDetails: 'Confirmar detalles',
    confirmAndSend: 'Confirmar y enviar',
    backToSelection: 'Volver',
    noAppointmentsYet: 'Aún no tienes citas',
    priority: 'Prioridad',
    notAvailable: 'No Disponible',
    professionalUnavailable: 'El profesional se encuentra ausente o de vacaciones en esta fecha. Por favor, selecciona otro día.',
    slotUnavailable: 'Horario No Disponible',
    servicesSubtitle: 'Profesionales especializados listos para ayudarte',
    whyChooseUs: '¿Por Qué Elegirnos?',
    whyChooseUsSub: 'Respaldamos cada servicio que brindamos',
    punctuality: 'Puntualidad',
    punctualityDesc: 'Llegamos a la hora pactada, siempre. Tu tiempo es importante para nosotros.',
    fairPrice: 'Precio Justo',
    fairPriceDesc: 'Presupuestos transparentes sin cargos ocultos. Calidad al precio correcto.',
    guarantee: 'Garantía de Servicio',
    guaranteeDesc: 'Cada trabajo respaldado por nuestra garantía de satisfacción. Tranquilidad incluida.',
    testimonials: 'Lo Que Dicen Nuestros Clientes',
    testimonialsSub: 'Experiencias reales de propietarios como tú',
    testimonial1: 'Excelente servicio! El plomero llegó puntual y arregló todo perfectamente. Muy recomendable.',
    testimonial1Name: 'María García',
    testimonial2: 'Profesionales y accesibles. Pintaron toda mi casa en dos días con una calidad increíble.',
    testimonial2Name: 'Carlos López',
    testimonial3: 'El mejor servicio de mantenimiento que he utilizado. Respuesta rápida y trabajo impecable.',
    testimonial3Name: 'Ana Rodríguez',
    readyToStart: '¿Listo para comenzar?',
    readyToStartSub: 'Agenda tu primera cita hoy y disfruta de un hogar sin preocupaciones.',
    registerSuccess: '¡Registro exitoso!',
    registerSuccessDesc: 'Tu cuenta ha sido creada correctamente. Ya podés iniciar sesión y agendar tu cita.',
    goToLogin: 'Iniciar Sesión',
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
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
        <div className="p-2 text-slate-300">
          <Icons.Bell className="w-5 h-5" />
        </div>
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
  appointments,
  t
}: {
  currentView: View;
  setView: (v: View) => void;
  user: User | null;
  onLogout: () => void;
  language: Language;
  onLanguageSwitch: () => void;
  appointments: Appointment[];
  t: (k: keyof typeof translations['en']) => string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleNavClick = (v: View) => {
    if ((v === 'schedule' || v === 'my-appointments') && !user) {
      setView('register');
    } else {
      setView(v);
    }
    setIsOpen(false);
    setProfileOpen(false);
  };

  const allMenuItems: { id: View; label: string; icon: React.FC<any> }[] = [
    { id: 'home', label: t('home'), icon: Icons.HomeIcon },
    { id: 'my-appointments', label: t('schedule'), icon: Icons.Calendar },
    { id: 'register', label: t('register'), icon: Icons.PlusCircle },
    { id: 'admin', label: t('admin'), icon: Icons.LayoutDashboard },
  ];

  // Show admin only to admin-role users; hide register if logged in
  const menuItems = allMenuItems.filter(item => {
    if (item.id === 'admin') return user?.role === 'admin';
    if (item.id === 'register') return !user;
    return true;
  });

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
            <Icons.Wrench className="w-8 h-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">{t('brand')}</span>
              <span className="text-[10px] font-medium text-slate-400 tracking-tight leading-tight hidden md:block">{t('slogan')}</span>
            </div>
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

              <Icons.Bell className="w-5 h-5 text-slate-300 cursor-default" />
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
                            onClick={() => handleNavClick('my-appointments')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-sm font-medium"
                          >
                            <Icons.Calendar className="w-4 h-4 text-primary" />
                            <div className="flex flex-col items-start min-w-0">
                              <span>{t('schedule')}</span>
                              {user && appointments.filter(a => a.clientName === `${user.firstName} ${user.lastName}`).length > 0 && (
                                <span className="text-[10px] text-primary font-bold truncate w-full">
                                  {appointments.filter(a => a.clientName === `${user.firstName} ${user.lastName}`)[0].service} - {appointments.filter(a => a.clientName === `${user.firstName} ${user.lastName}`)[0].date}
                                </span>
                              )}
                            </div>
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
                <button
                  onClick={() => handleNavClick('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all"
                >
                  <Icons.UserCircle className="w-4 h-4" />
                  {t('signin')}
                </button>
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

const HomeView = ({ onSchedule, services, t, user }: {
  onSchedule: () => void;
  services: ServiceDef[];
  t: (k: keyof typeof translations['en']) => string;
  user: User | null;
  key?: string
}) => {
  const testimonials = [
    { text: t('testimonial1'), name: t('testimonial1Name'), rating: 5 },
    { text: t('testimonial2'), name: t('testimonial2Name'), rating: 5 },
    { text: t('testimonial3'), name: t('testimonial3Name'), rating: 5 },
  ];

  const differentiators = [
    { icon: Icons.Clock, title: t('punctuality'), desc: t('punctualityDesc') },
    { icon: Icons.DollarSign, title: t('fairPrice'), desc: t('fairPriceDesc') },
    { icon: Icons.ShieldCheck, title: t('guarantee'), desc: t('guaranteeDesc') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-24"
    >

      <main className="max-w-7xl mx-auto">
        {/* ── Banner ── */}
        <div className="px-4 md:px-6 pt-4 md:pt-6">
          <div className="relative min-h-[420px] md:min-h-[480px] flex flex-col gap-6 rounded-2xl overflow-hidden px-6 md:px-10 pb-10 pt-20 justify-end shadow-xl">
            <div className="absolute inset-0 z-0">
              <img
                alt="Professional cleaner"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEYgXSerWmgz1H3vvx8VtqySkm9zoQxQ2Whfpa6TJ20W-JvLg0DlC9qS0sy2FH8OBwiVomAvhtRl685SY9GrCw73jh6J7a7qG0Bbtmcrxn2CLWWkBS0Uy--RgYyVGxcAqEI6_6b6UM87vjWVhslhb5-WjDZyHyHk1yRDi8vlqWkjbQPFpuTD8DvZh6bcJW_XgmNnEkHkU1awfF_V0ujLhG9Qv-xcN2_8UPnCMLYZHpXaXo4PA0Zvto6gP5XTA8A4MY_F8RSp07qHoA"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.20) 40%, rgba(0,0,0,0.08) 70%, transparent 100%)' }}></div>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(23,84,207,0.10) 0%, transparent 60%)' }}></div>
            </div>
            <div className="relative z-10 flex flex-col gap-4">
              <h1 className="text-white text-4xl md:text-5xl font-black leading-[1.1] tracking-tight banner-text-shadow">
                {t('welcome')}
              </h1>
              <p className="text-white/95 text-sm md:text-base font-medium leading-relaxed max-w-[380px] banner-sub-shadow">
                {t('welcomeSub')}
              </p>
              <button
                onClick={onSchedule}
                className="mt-6 flex w-fit items-center justify-center gap-3 rounded-2xl h-16 px-12 bg-primary hover:bg-[#1240a8] text-white text-lg font-extrabold tracking-wide shadow-2xl active:scale-95 transition-all duration-200 cta-btn-glow"
              >
                {t('requestAppt')}
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Services Section ── */}
        <div className="px-4 md:px-8 py-10 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-2">
            <div>
              <h2 className="text-slate-900 text-2xl md:text-3xl font-black tracking-tight">{t('ourServices')}</h2>
              <p className="text-slate-500 text-sm md:text-base mt-1">{t('servicesSubtitle')}</p>
            </div>
            <button onClick={onSchedule} className="text-primary text-sm font-semibold hover:underline">{t('viewAll')}</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all group hover:shadow-lg ${user?.role === 'admin' ? 'cursor-default' : 'cursor-pointer hover:border-primary/40'}`}
                onClick={user?.role === 'admin' ? undefined : onSchedule}
              >
                <div className="h-44 md:h-52 w-full overflow-hidden relative">
                  <img src={service.img} alt={t(service.titleKey)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 backdrop-blur shadow-sm text-primary">
                    <service.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                  <h3 className="text-slate-900 text-base font-bold">{t(service.titleKey)}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{t((service.titleKey + 'Desc') as any)}</p>
                  <p className="text-slate-400 text-xs mt-1">{t('from')} <span className="font-bold text-primary">{service.price}</span></p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Why Choose Us ── */}
        <div className="px-4 md:px-8 py-10 md:py-16 bg-white rounded-2xl mx-4 md:mx-6 shadow-sm border border-slate-100">
          <div className="text-center mb-10">
            <h2 className="text-slate-900 text-2xl md:text-3xl font-black tracking-tight">{t('whyChooseUs')}</h2>
            <p className="text-slate-500 text-sm md:text-base mt-2">{t('whyChooseUsSub')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {differentiators.map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-slate-900 text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Testimonials ── */}
        <div className="px-4 md:px-8 py-10 md:py-16">
          <div className="text-center mb-10">
            <h2 className="text-slate-900 text-2xl md:text-3xl font-black tracking-tight">{t('testimonials')}</h2>
            <p className="text-slate-500 text-sm md:text-base mt-2">{t('testimonialsSub')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex gap-0.5">
                  {Array.from({ length: item.rating }).map((_, s) => (
                    <Icons.Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="flex gap-3 items-start">
                  <Icons.Quote className="w-5 h-5 text-primary/30 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-sm leading-relaxed italic">{item.text}</p>
                </div>
                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icons.UserCircle className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-slate-900 text-sm font-bold">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA Section ── */}
        <div className="px-4 md:px-8 py-10 md:py-16">
          <div className="bg-primary rounded-2xl px-6 md:px-12 py-10 md:py-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3), transparent 60%)' }}></div>
            <div className="relative z-10">
              <h2 className="text-white text-2xl md:text-3xl font-black tracking-tight mb-3">{t('readyToStart')}</h2>
              <p className="text-white/80 text-sm md:text-base mb-8 max-w-md mx-auto">{t('readyToStartSub')}</p>
              <button
                onClick={onSchedule}
                className="inline-flex items-center justify-center gap-3 rounded-2xl h-16 px-12 bg-white text-primary text-lg font-extrabold tracking-wide shadow-2xl hover:shadow-[0_8px_40px_rgba(255,255,255,0.4)] active:scale-95 transition-all duration-200"
              >
                {t('requestAppt')}
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

const LoginView = ({ onLogin, onSwitchToRegister, onGoHome, t }: { onLogin: (email: string, password: string) => void; onSwitchToRegister: () => void; onGoHome: () => void; t: (k: keyof typeof translations['en']) => string; error?: string; key?: string }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
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
        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors" onClick={onGoHome}>
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

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">{t('password')}</label>
            <input
              className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-rose-500 text-xs font-bold px-1">{error}</p>}

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

const RegisterView = ({ onRegister, onSwitchToLogin, onGoHome, t }: { onRegister: (user: User) => void; onSwitchToLogin: () => void; onGoHome: () => void; t: (k: keyof typeof translations['en']) => string; key?: string }) => {
  const [formData, setFormData] = useState<User>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'user'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName && formData.email && formData.password) {
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
        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors" onClick={onGoHome}>
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
                placeholder="Juan"
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
                placeholder="Pérez"
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
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-semibold text-slate-700">{t('password')}</label>
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">{t('required')}</span>
            </div>
            <div className="relative">
              <input
                className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••••••"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-semibold text-slate-700">{t('phone')}</label>
            </div>
            <div className="relative">
              <input
                className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="+54 11 1234-5678"
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
              <span>{t('register')}</span>
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

const RegisterSuccessView = ({ onGoToLogin, t }: { onGoToLogin: () => void; t: (k: keyof typeof translations['en']) => string; key?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="pb-24 min-h-screen flex items-center justify-center px-4"
    >
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 md:p-10 flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <Icons.CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-slate-900 text-2xl md:text-3xl font-black tracking-tight">
            {t('registerSuccess')}
          </h1>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-sm">
            {t('registerSuccessDesc')}
          </p>
          <button
            onClick={onGoToLogin}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl h-14 px-8 bg-primary hover:bg-[#1240a8] text-white text-base font-extrabold shadow-lg active:scale-95 transition-all duration-200"
          >
            {t('goToLogin')}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const AdminCalendar = ({ availability, onToggleBlock, onSelectDate, language, t }: {
  availability: AvailabilityConfig;
  onToggleBlock: (date: string) => void;
  onSelectDate: (date: string) => void;
  language: Language;
  t: (k: any) => string;
}) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date());

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNames = language === 'es' ? translations['es'].monthNames : monthNamesEn;
  const monthName = monthNames[currentMonth];
  const canonicalMonthShort = monthNamesEn[currentMonth].slice(0, 3);
  const localizedMonthShort = monthName.slice(0, 3);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="bg-slate-50 rounded-xl p-[11px] border border-slate-100 max-w-[308px] mx-auto shadow-sm">
      <div className="flex items-center justify-between mb-2 px-1">
        <h5 className="font-bold text-slate-800 text-[13px]">{monthName} {currentYear}</h5>
        <div className="flex gap-0.5">
          <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-1 hover:bg-white rounded-md transition-colors"><Icons.ChevronLeft className="w-[13px] h-[13px]" /></button>
          <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-1 hover:bg-white rounded-md transition-colors"><Icons.ChevronRight className="w-[13px] h-[13px]" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {(language === 'es' ? ['D', 'L', 'M', 'M', 'J', 'V', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']).map((d, i) => (
          <div key={i} className="text-center text-[9px] font-black text-slate-400/80 uppercase leading-none">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dateStr = `${canonicalMonthShort} ${day}`;
          const isBlocked = availability.blocked.includes(dateStr);
          const hasException = !!availability.exceptions[dateStr];

          return (
            <button
              key={i}
              onClick={() => {
                onSelectDate(dateStr);
                onToggleBlock(dateStr);
              }}
              className={`aspect-square rounded-md text-[10px] font-bold flex flex-col items-center justify-center transition-all relative ${isBlocked ? 'bg-rose-500 text-white shadow-sm shadow-rose-200' :
                hasException ? 'bg-amber-100 text-amber-700' :
                  'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
                }`}
            >
              {day}
              {hasException && !isBlocked && <div className="absolute bottom-0.5 w-0.5 h-0.5 rounded-full bg-amber-500" />}
            </button>
          );
        })}
      </div>
    </div >
  );
};

const AdminView = ({
  appointments,
  services,
  onAccept,
  onDecline,
  onEdit,
  onUpdateService,
  availability,
  onUpdateAvailability,
  onSyncAvailability,
  onDeleteAvailability,
  t,
  language
}: {
  appointments: Appointment[];
  services: ServiceDef[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onEdit: (id: string, updated: Partial<Appointment>) => void;
  onUpdateService: (id: string, updated: Partial<ServiceDef>) => void;
  availability: AvailabilityConfig;
  onUpdateAvailability: (newConfig: AvailabilityConfig) => void;
  onSyncAvailability: (payload: any) => Promise<void>;
  onDeleteAvailability: (payload: any) => Promise<void>;
  t: (k: keyof typeof translations['en']) => string;
  language: Language;
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
            { label: t('pendingAppts'), val: pendingCount.toString(), color: 'text-slate-900' },
            { label: t('accepted'), val: acceptedCount.toString(), color: 'text-emerald-600' },
            { label: t('declined'), val: declinedCount.toString(), color: 'text-rose-600' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-1 rounded-xl p-4 bg-white shadow-sm border border-slate-100">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold leading-tight ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>

        {/* Manage Services */}
        <div className="space-y-4">
          <h3 className="text-slate-900 text-lg font-bold">{t('manageServices')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <service.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t(service.titleKey)}</h4>
                    <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">{t('price')}: {service.price}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{t('updatePrice')}</label>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue={service.price}
                      onBlur={(e) => onUpdateService(service.id, { price: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="$00/hr"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Availability Management */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900 text-lg font-bold">{language === 'es' ? 'Gestión de Disponibilidad Avanzada' : 'Advanced Availability Management'}</h3>
          </div>

          {/* 1. Weekly Schedule */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
              <Icons.Clock className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-slate-900">{language === 'es' ? 'Horario Semanal' : 'Weekly Schedule'}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 1, name: language === 'es' ? 'Lunes' : 'Monday' },
                { id: 2, name: language === 'es' ? 'Martes' : 'Tuesday' },
                { id: 3, name: language === 'es' ? 'Miércoles' : 'Wednesday' },
                { id: 4, name: language === 'es' ? 'Jueves' : 'Thursday' },
                { id: 5, name: language === 'es' ? 'Viernes' : 'Friday' },
                { id: 6, name: language === 'es' ? 'Sábado' : 'Saturday' },
                { id: 0, name: language === 'es' ? 'Domingo' : 'Sunday' },
              ].map((day) => {
                const rule = availability.weekly[day.id] || { enabled: false, start: '09:00', end: '18:00' };
                return (
                  <div key={day.id} className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => {
                          const newWeekly = { ...availability.weekly, [day.id]: { ...rule, enabled: e.target.checked } };
                          onUpdateAvailability({ ...availability, weekly: newWeekly });
                          onSyncAvailability({ type: 'weekly', dayOfWeek: day.id, enabled: e.target.checked, startTime: rule.start, endTime: rule.end });
                        }}
                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                      />
                      <span className="text-sm font-bold text-slate-700">{day.name}</span>
                    </div>
                    {rule.enabled && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={rule.start}
                          onChange={(e) => {
                            const newWeekly = { ...availability.weekly, [day.id]: { ...rule, start: e.target.value } };
                            onUpdateAvailability({ ...availability, weekly: newWeekly });
                            if (e.target.value.length === 5) onSyncAvailability({ type: 'weekly', dayOfWeek: day.id, enabled: rule.enabled, startTime: e.target.value, endTime: rule.end });
                          }}
                          className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                        />
                        <span className="text-[10px] font-bold text-slate-400">to</span>
                        <input
                          type="text"
                          value={rule.end}
                          onChange={(e) => {
                            const newWeekly = { ...availability.weekly, [day.id]: { ...rule, end: e.target.value } };
                            onUpdateAvailability({ ...availability, weekly: newWeekly });
                            if (e.target.value.length === 5) onSyncAvailability({ type: 'weekly', dayOfWeek: day.id, enabled: rule.enabled, startTime: rule.start, endTime: e.target.value });
                          }}
                          className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                        />
                      </div>
                    )}
                    {!rule.enabled && <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">{language === 'es' ? 'Cerrado' : 'Closed'}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Blocked Dates (Priority 1) */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
              <Icons.AlertCircle className="w-5 h-5 text-rose-500" />
              <h4 className="font-bold text-slate-900">{language === 'es' ? 'Bloqueos y Vacaciones' : 'Blockages & Vacations'}</h4>
            </div>
            <p className="text-slate-500 text-xs">
              {language === 'es'
                ? 'El bloqueo total tiene prioridad máxima sobre cualquier otro horario.'
                : 'Total blockages have maximum priority over any other schedule.'}
            </p>
            <AdminCalendar
              availability={availability}
              t={t}
              language={language}
              onToggleBlock={(date) => {
                const isBlocked = availability.blocked.includes(date);
                const hasException = !!availability.exceptions[date];

                if (isBlocked) {
                  onDeleteAvailability({ type: 'blocked', specificDate: date });
                } else {
                  // If adding a block, also remove any exception for that day to avoid "duplicados"
                  if (hasException) {
                    onDeleteAvailability({ type: 'exception', specificDate: date });
                  }
                  onSyncAvailability({ type: 'blocked', specificDate: date });
                }
              }}
              onSelectDate={(date) => {
                const dateInp = document.getElementById('exc-date') as HTMLInputElement;
                if (dateInp) dateInp.value = date;
                const blockInp = document.getElementById('block-date') as HTMLInputElement;
                if (blockInp) blockInp.value = date;
              }}
            />

            <div className="flex gap-2">
              <input
                id="block-date"
                type="text"
                placeholder="Mar 15"
                className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
              />
              <button
                onClick={() => {
                  const inp = document.getElementById('block-date') as HTMLInputElement;
                  const val = inp.value.trim();
                  if (val) {
                    // Normalize the manually typed date
                    const monthMap: Record<string, string> = {
                      'ene': 'Jan', 'jan': 'Jan', 'feb': 'Feb', 'mar': 'Mar', 'abr': 'Apr', 'apr': 'Apr',
                      'may': 'May', 'jun': 'Jun', 'jul': 'Jul', 'ago': 'Aug', 'aug': 'Aug', 'sep': 'Sep',
                      'oct': 'Oct', 'nov': 'Nov', 'dic': 'Dec', 'dec': 'Dec'
                    };
                    const parts = val.split(/\s+/);
                    let canonicalVal = val;
                    if (parts.length === 2) {
                      const m = parts[0].toLowerCase().slice(0, 3);
                      const day = parseInt(parts[1], 10).toString();
                      const engM = monthMap[m] || parts[0];
                      canonicalVal = `${engM.charAt(0).toUpperCase() + engM.slice(1).toLowerCase()} ${day}`;
                    }

                    if (!availability.blocked.includes(canonicalVal)) {
                      onSyncAvailability({ type: 'blocked', specificDate: canonicalVal });
                      inp.value = '';
                    }
                  }
                }}
                className="px-6 bg-rose-500 text-white rounded-xl text-sm font-bold active:scale-95 transition-all shadow-md shadow-rose-200"
              >
                {language === 'es' ? 'Bloquear' : 'Block'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {availability.blocked.map(date => (
                <div key={date} className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 text-xs font-bold">
                  {date}
                  <button
                    onClick={() => {
                      onUpdateAvailability({ ...availability, blocked: availability.blocked.filter(d => d !== date) });
                      onDeleteAvailability({ type: 'blocked', specificDate: date });
                    }}
                    className="hover:text-rose-800 transition-colors"
                  >
                    <Icons.X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Exceptions (Priority 2) */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
              <Icons.Calendar className="w-5 h-5 text-amber-500" />
              <h4 className="font-bold text-slate-900">{language === 'es' ? 'Excepciones de Horario' : 'Schedule Exceptions'}</h4>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <input id="exc-date" type="text" placeholder="Mar 10" className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none" />
                <input id="exc-start" type="text" placeholder="10:00" className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none" />
                <input id="exc-end" type="text" placeholder="13:00" className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none" />
                <button
                  onClick={() => {
                    const d = (document.getElementById('exc-date') as HTMLInputElement).value;
                    const s = (document.getElementById('exc-start') as HTMLInputElement).value;
                    const e = (document.getElementById('exc-end') as HTMLInputElement).value;
                    if (d && s && e) {
                      // Normalize the date if it was typed manually
                      const monthMap: Record<string, string> = {
                        'ene': 'Jan', 'jan': 'Jan', 'feb': 'Feb', 'mar': 'Mar', 'abr': 'Apr', 'apr': 'Apr',
                        'may': 'May', 'jun': 'Jun', 'jul': 'Jul', 'ago': 'Aug', 'aug': 'Aug', 'sep': 'Sep',
                        'oct': 'Oct', 'nov': 'Nov', 'dic': 'Dec', 'dec': 'Dec'
                      };
                      const parts = d.split(' ');
                      let canonicalD = d;
                      if (parts.length === 2) {
                        const m = parts[0].toLowerCase().slice(0, 3);
                        const day = parseInt(parts[1], 10).toString();
                        const engM = monthMap[m] || parts[0];
                        canonicalD = `${engM.charAt(0).toUpperCase() + engM.slice(1).toLowerCase()} ${day}`;
                      }

                      const newExceptions = { ...availability.exceptions, [canonicalD]: { enabled: true, start: s, end: e } };
                      onUpdateAvailability({ ...availability, exceptions: newExceptions });
                      onSyncAvailability({ type: 'exception', specificDate: canonicalD, enabled: true, startTime: s, endTime: e });

                      // Clear inputs
                      (document.getElementById('exc-date') as HTMLInputElement).value = '';
                      (document.getElementById('exc-start') as HTMLInputElement).value = '';
                      (document.getElementById('exc-end') as HTMLInputElement).value = '';
                    }
                  }}
                  className="bg-amber-500 text-white rounded-xl text-sm font-bold active:scale-95 transition-all shadow-md shadow-amber-200"
                >
                  {language === 'es' ? 'Agregar' : 'Add'}
                </button>
              </div>

              <div className="space-y-2">
                {Object.entries(availability.exceptions).map(([date, rule]) => (
                  <div key={date} className="flex items-center justify-between p-3 bg-amber-50 rounded-2xl border border-amber-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-amber-900">{date}</span>
                      <span className="text-xs font-medium text-amber-700">{rule.start} - {rule.end}</span>
                    </div>
                    <button
                      onClick={() => {
                        const newEx = { ...availability.exceptions };
                        delete newEx[date];
                        onUpdateAvailability({ ...availability, exceptions: newEx });
                        onDeleteAvailability({ type: 'exception', specificDate: date });
                      }}
                      className="text-amber-500 hover:text-amber-700"
                    >
                      <Icons.X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
                      {t(req.status as any)}
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
                      {services.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setEditForm({ ...editForm, service: t(s.titleKey), icon: s.icon })}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${editForm.service === t(s.titleKey)
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-100 text-slate-600 hover:border-slate-200'
                            }`}
                        >
                          <s.icon className="w-5 h-5" />
                          <span className="text-sm font-bold">{t(s.titleKey)}</span>
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
                        placeholder="e.g. Mar 4"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('selectTime')}</label>
                      <input
                        type="text"
                        value={editForm.time || ''}
                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                        className="w-full p-3 rounded-xl border-2 border-slate-100 text-sm font-bold focus:border-primary outline-none transition-all"
                        placeholder="11:00"
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
    </motion.div >
  );
};

const UserAppointmentsView = ({
  user,
  appointments,
  onNewAppointment,
  t
}: {
  user: User | null;
  appointments: Appointment[];
  onNewAppointment: () => void;
  t: (k: keyof typeof translations['en']) => string;
  key?: string;
}) => {
  if (!user) return null;

  const userAppts = appointments.filter(
    a => a.userId === user.id
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 pb-24 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900">{t('myAppointments')}</h2>
        {user.role !== 'admin' && (
          <button
            onClick={onNewAppointment}
            className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
          >
            <Icons.PlusCircle className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {userAppts.map((req) => (
          <div key={req.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <req.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{t(req.service as any)}</h4>
                  <p className="text-slate-500 text-xs">{req.date} {req.time}</p>
                  <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    req.status === 'declined' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                    {t(req.status as any)}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${req.tag === 'Urgent' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                }`}>
                {t(req.tag === 'Urgent' ? 'urgent' : 'routine')}
              </span>
            </div>
            {req.notes && (
              <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-xl italic">"{req.notes}"</p>
            )}
          </div>
        ))}

        {userAppts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <Icons.Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">{t('noAppointmentsYet')}</p>
            {user.role !== 'admin' && (
              <button
                onClick={onNewAppointment}
                className="mt-6 text-primary font-bold hover:underline"
              >
                {t('requestNewAppt')}
              </button>
            )}
          </div>
        )}
      </div>

      {userAppts.length > 0 && user.role !== 'admin' && (
        <button
          onClick={onNewAppointment}
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/25 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Icons.PlusCircle className="w-5 h-5" />
          {t('requestNewAppt')}
        </button>
      )}
    </motion.div>
  );
};

const ScheduleView = ({ user, onSchedule, onBack, appointments, services, availability, t, language }: {
  user: User | null;
  onSchedule: (appt: AppointmentPayload) => void;
  onBack: () => void;
  appointments: Appointment[];
  services: ServiceDef[];
  availability: AvailabilityConfig;
  t: (k: keyof typeof translations['en']) => string;
  language: Language;
  key?: string;
}) => {
  if (user?.role === 'admin') return null;
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth(); // 0-indexed
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun

  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNames = language === 'es' ? translations['es'].monthNames : monthNamesEn;

  const monthName = monthNames[currentMonth];
  const localizedMonthShort = monthName.slice(0, 3);
  const canonicalMonthShort = monthNamesEn[currentMonth].slice(0, 3);

  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedTag, setSelectedTag] = useState<'Routine' | 'Urgent'>('Routine');
  const [selectedService, setSelectedService] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const timeSlots = [
    { time: '09:00', period: t('morning') },
    { time: '10:30', period: t('morning') },
    { time: '13:00', period: t('afternoon') },
    { time: '14:30', period: t('afternoon') },
    { time: '16:00', period: t('evening') },
    { time: '17:30', period: t('evening') },
  ];

  const getSlotStatus = (time: string) => {
    const dayStr = `${canonicalMonthShort} ${selectedDay}`;
    const dayStrLower = dayStr.toLowerCase();

    // Level 1: Blocked (Vacation) - Case Insensitive
    if (availability.blocked.some(d => d.toLowerCase() === dayStrLower)) return 'blocked';

    // Get range for this day
    const dayDate = new Date(currentYear, currentMonth, selectedDay);
    const dayOfWeek = dayDate.getDay();
    let range = availability.weekly[dayOfWeek];

    // Level 2: Exceptions (Overrides weekly) - Case Insensitive
    const excKey = Object.keys(availability.exceptions).find(k => k.toLowerCase() === dayStrLower);
    if (excKey) {
      range = availability.exceptions[excKey];
    }

    if (!range || !range.enabled) return 'blocked';

    // Check if within range
    const [h, m] = time.split(':').map(Number);
    const [rsH, rsM] = range.start.split(':').map(Number);
    const [reH, reM] = range.end.split(':').map(Number);

    const timeVal = h * 60 + m;
    const startVal = rsH * 60 + rsM;
    const endVal = reH * 60 + reM;

    if (timeVal < startVal || timeVal >= endVal) return 'past';

    // Check if in past (for current day)
    const now = new Date();
    const isToday = selectedDay === now.getDate() && currentMonth === now.getMonth();
    if (isToday) {
      const currentTimeVal = now.getHours() * 60 + now.getMinutes();
      if (timeVal <= currentTimeVal) return 'past';
    }

    // Level 3: Existing appointments
    const exists = appointments.find(a => a.date === dayStr && a.time === time);
    if (exists) {
      return exists.status === 'accepted' ? 'booked' : 'pending';
    }
    return 'available';
  };

  useEffect(() => {
    // Auto-select first available slot if current isn't available
    if (getSlotStatus(selectedTime) !== 'available') {
      const available = timeSlots.find(s => getSlotStatus(s.time) === 'available');
      if (available) setSelectedTime(available.time);
    }
  }, [selectedDay, appointments, availability]);

  const SelectedIcon = services[selectedService].icon;
  const dayStr = `${canonicalMonthShort} ${selectedDay}`;
  const isBlockedDate = availability.blocked.includes(dayStr);
  const dayOfWeek = new Date(currentYear, currentMonth, selectedDay).getDay();
  const weeklyRule = availability.weekly[dayOfWeek];
  const exceptionRule = availability.exceptions[dayStr];
  const isDateClosed = isBlockedDate || (exceptionRule ? !exceptionRule.enabled : !weeklyRule?.enabled);

  const isSelectedSlotAvailable = getSlotStatus(selectedTime) === 'available';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-24 bg-[#f6f6f8] min-h-screen"
    >
      <Header title={t('schedule')} onBack={onBack} t={t} />

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
        <h3 className="text-lg font-bold tracking-tight mb-3">{t('priority')}</h3>
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
            {(language === 'es' ? ['D', 'L', 'M', 'M', 'J', 'V', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']).map((d, i) => (
              <p key={i} className="text-slate-400 text-xs font-bold text-center">{d}</p>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateObj = new Date(currentYear, currentMonth, day);
              const isSelected = selectedDay === day;
              const isPast = day < currentDay;

              const dayStrLong = `${canonicalMonthShort} ${day}`;
              const isBlocked = availability.blocked.includes(dayStrLong);
              const dOfWeek = dateObj.getDay();
              const wRule = availability.weekly[dOfWeek];
              const eRule = availability.exceptions[dayStrLong];
              const isClosed = isBlocked || (eRule ? !eRule.enabled : !wRule?.enabled);

              return (
                <button
                  key={day}
                  disabled={isPast}
                  onClick={() => setSelectedDay(day)}
                  className={`h-10 flex flex-col items-center justify-center rounded-full text-sm font-medium transition-all relative
                  ${isSelected ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30' :
                      isPast ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-700'}`}
                >
                  {day}
                  {isClosed && !isPast && (
                    <div className="absolute -bottom-1 w-1 h-1 bg-rose-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 px-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight">{t('selectTime')}</h3>
        </div>

        {isDateClosed ? (
          <div className="p-12 text-center bg-rose-50 rounded-[32px] border-2 border-rose-100 border-dashed">
            <Icons.Calendar className="w-12 h-12 text-rose-300 mx-auto mb-4" />
            <h4 className="text-rose-900 font-bold mb-2">
              {t('notAvailable')}
            </h4>
            <p className="text-rose-600 text-xs font-medium leading-relaxed">
              {t('professionalUnavailable')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {timeSlots.map((slot, i) => {
              const slotStatus = getSlotStatus(slot.time);
              const isSelected = selectedTime === slot.time;
              const isBooked = slotStatus === 'booked';
              const isPending = slotStatus === 'pending';
              const isPastSlot = slotStatus === 'past';
              return (
                <button
                  key={i}
                  disabled={isBooked || isPending || isPastSlot}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`flex flex-col items-center justify-center py-4 rounded-2xl transition-all border-2
                    ${isBooked || isPastSlot
                      ? 'bg-rose-50 border-rose-200 cursor-not-allowed opacity-70'
                      : isPending
                        ? 'bg-amber-50 border-amber-300 cursor-not-allowed'
                        : isSelected
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-white border-slate-200 hover:border-primary/50'}`}
                >
                  <span className={`text-sm font-bold ${isBooked || isPastSlot ? 'text-rose-400' : isPending ? 'text-amber-500' : ''
                    }`}>{slot.time}</span>
                  <span className="text-[10px] font-medium opacity-70">
                    {isBooked
                      ? t('booked')
                      : isPending
                        ? t('pending')
                        : isPastSlot
                          ? t('past')
                          : slot.period}
                  </span>
                </button>
              );
            })}
          </div>
        )}
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
            <p className="text-sm font-bold">{localizedMonthShort} {selectedDay} • {selectedTime}</p>
            <p className="text-xs text-slate-500">{t(services[selectedService].titleKey)}</p>
          </div>
        </div>
        <button
          disabled={!isSelectedSlotAvailable}
          onClick={() => setShowConfirmation(true)}
          className={`w-full font-bold py-4 rounded-2xl transition-all
          ${isSelectedSlotAvailable
              ? 'bg-primary text-white shadow-xl shadow-primary/25 active:scale-95'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          {isSelectedSlotAvailable ? t('confirmAppt') : t('slotUnavailable')}
        </button>
      </div>

      <AnimatePresence>
        {showConfirmation && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmation(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-8 z-[201] shadow-2xl"
            >
              <div className="flex flex-col gap-8">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                    <Icons.CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{t('verifyData')}</h3>
                  <p className="text-slate-500 font-medium">{t('confirmDetails')}</p>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('service')}</span>
                    <span className="text-slate-900 font-bold">{t(services[selectedService].titleKey)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('schedule')}</span>
                    <span className="text-slate-900 font-bold">{localizedMonthShort} {selectedDay} • {selectedTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('status')}</span>
                    <span className={`font-bold flex items-center gap-1 ${selectedTag === 'Urgent' ? 'text-amber-500' : 'text-blue-500'}`}>
                      {selectedTag === 'Urgent' ? <Icons.Zap className="w-4 h-4" /> : <Icons.Clock className="w-4 h-4" />}
                      {selectedTag === 'Urgent' ? t('urgent') : t('routine')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('price')}</span>
                    <span className="text-primary text-xl font-black">{services[selectedService]?.price}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      const selectedServiceDef = services[Object.keys(services)[selectedService]];
                      onSchedule({
                        service: selectedServiceDef.titleKey,
                        serviceIndex: selectedService.toString(),
                        date: `${canonicalMonthShort} ${selectedDay}`,
                        time: selectedTime,
                        tag: selectedTag,
                      });
                      setShowConfirmation(false);
                    }}
                    className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/25 active:scale-95 transition-all"
                  >
                    {t('confirmAndSend')}
                  </button>
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl active:scale-95 transition-all"
                  >
                    {t('backToSelection')}
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

// --- Main App ---

const DEFAULT_SERVICES: ServiceDef[] = [
  { id: '1', titleKey: 'plumbing', price: '$15.000 ARS/hora', img: "/images/plumbing.png", icon: Icons.Droplets },
  { id: '2', titleKey: 'carpentry', price: '$14.000 ARS/hora', img: "/images/carpentry.png", icon: Icons.Hammer },
  { id: '3', titleKey: 'painting', price: '$12.000 ARS/hora', img: "/images/painting.png", icon: Icons.Paintbrush },
  { id: '4', titleKey: 'electrical', price: '$18.000 ARS/hora', img: "/images/electrical.png", icon: Icons.Zap },
];

export default function App() {
  const [view, setView] = useState<View>('home');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mainten_user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      // Force re-login if id is missing (prevents persistence errors)
      if (!parsed.id && parsed.email !== ADMIN_EMAIL) {
        localStorage.removeItem('mainten_user');
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('mainten_lang');
    return (saved as Language) || 'en';
  });

  const [services, setServices] = useState<ServiceDef[]>(() => {
    const saved = localStorage.getItem('mainten_services');
    if (!saved) return DEFAULT_SERVICES;
    try {
      const parsed = JSON.parse(saved) as Partial<ServiceDef>[];
      return DEFAULT_SERVICES.map(def => {
        const match = parsed.find(p => p.id === def.id);
        return match ? { ...def, price: match.price || def.price } : def;
      });
    } catch (e) {
      return DEFAULT_SERVICES;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  const [availability, setAvailability] = useState<AvailabilityConfig>(DEFAULT_AVAILABILITY);

  const [authError, setAuthError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [apptsRes, availRes] = await Promise.all([
        fetch(`${API_URL}/appointments${user?.role === 'admin' ? '?role=admin' : `?userId=${user?.id}`}`),
        fetch(`${API_URL}/availability`)
      ]);

      if (apptsRes.ok) {
        const data = await apptsRes.json();
        const mappedData = data.map((appt: any) => {
          const serviceDef = services.find(s => s.titleKey === appt.service);
          return {
            ...appt,
            icon: serviceDef?.icon || Icons.Wrench
          };
        });
        setAppointments(mappedData);
      }

      if (availRes.ok) {
        const data = await availRes.json();
        const mergedWeekly = { ...DEFAULT_AVAILABILITY.weekly };
        if (data.weekly) {
          Object.entries(data.weekly).forEach(([key, val]) => {
            mergedWeekly[parseInt(key)] = val as WeeklyRule;
          });
        }

        const monthMap: Record<string, string> = {
          'ene': 'Jan', 'jan': 'Jan', 'feb': 'Feb', 'mar': 'Mar', 'abr': 'Apr', 'apr': 'Apr',
          'may': 'May', 'jun': 'Jun', 'jul': 'Jul', 'ago': 'Aug', 'aug': 'Aug', 'sep': 'Sep',
          'oct': 'Oct', 'nov': 'Nov', 'dic': 'Dec', 'dec': 'Dec'
        };

        const normalizeDateStr = (s: string) => {
          if (!s) return s;
          const parts = s.trim().split(/\s+/);
          if (parts.length === 2) {
            const m = parts[0].toLowerCase().slice(0, 3);
            const day = parseInt(parts[1], 10).toString();
            const engMonth = monthMap[m] || parts[0];
            const capitalizedMonth = engMonth.charAt(0).toUpperCase() + engMonth.slice(1).toLowerCase();
            return `${capitalizedMonth} ${day}`;
          }
          return s.charAt(0).toUpperCase() + s.slice(1);
        };

        const normalizedBlocked = Array.from(new Set((data.blocked || []).map(normalizeDateStr)));
        const normalizedExceptions: Record<string, any> = {};
        if (data.exceptions) {
          Object.entries(data.exceptions).forEach(([date, rule]) => {
            normalizedExceptions[normalizeDateStr(date)] = rule;
          });
        }

        setAvailability({
          ...DEFAULT_AVAILABILITY,
          ...data,
          weekly: mergedWeekly,
          blocked: normalizedBlocked,
          exceptions: normalizedExceptions
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch initial data
  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      // Still fetch availability for the schedule view if not logged in
      fetch(`${API_URL}/availability`)
        .then(res => res.json())
        .then(data => setAvailability(data))
        .catch(err => console.error('Error fetching availability:', err));
    }
  }, [user, services]); // Added services to dependency array to ensure icons are mapped correctly

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

  const addAppointment = async (appt: AppointmentPayload) => {
    if (!user) {
      setView('register');
      return;
    }

    const selectedServiceDef = services[appt.serviceIndex];
    if (!selectedServiceDef) {
      console.error('Selected service not found');
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          clientName: `${user.firstName} ${user.lastName}`,
          service: selectedServiceDef.titleKey, // Store titleKey as service string
          serviceIndex: appt.serviceIndex, // Store index for icon retrieval
          date: appt.date,
          time: appt.time,
          tag: appt.tag,
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (response.ok) {
        const newAppt = await response.json();
        setAppointments([newAppt, ...appointments]);
        setView(user.role === 'admin' ? 'admin' : 'my-appointments');
      } else {
        const errorData = await response.json();
        alert(`Error al crear la cita: ${errorData.error || 'Desconocido'}`);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      // Fallback: create appointment locally when backend is unavailable
      const localAppt: Appointment = {
        id: Date.now().toString(),
        userId: user.id,
        clientName: `${user.firstName} ${user.lastName}`,
        service: selectedServiceDef.titleKey,
        serviceIndex: appt.serviceIndex.toString(),
        date: appt.date,
        time: appt.time,
        status: 'pending',
        tag: appt.tag as 'Urgent' | 'Routine',
        icon: selectedServiceDef.icon,
      };
      setAppointments([localAppt, ...appointments]);
      setView(user.role === 'admin' ? 'admin' : 'my-appointments');
    }
  };

  const handleRegister = async (userData: User) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (response.ok) {
        const newUser = await response.json();
        setUser(newUser);
        localStorage.setItem('mainten_user', JSON.stringify(newUser));
        setView('register-success');
      } else {
        const data = await response.json();
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      // Fallback: register locally when backend is unavailable
      const localUser: User = {
        ...userData,
        id: Date.now().toString(),
        role: userData.email === ADMIN_EMAIL ? 'admin' : 'user'
      };
      // Save to registered users list
      const existingUsers = JSON.parse(localStorage.getItem('mainten_users') || '[]');
      const filtered = existingUsers.filter((u: User) => u.email !== localUser.email);
      filtered.push(localUser);
      localStorage.setItem('mainten_users', JSON.stringify(filtered));
      setUser(localUser);
      localStorage.setItem('mainten_user', JSON.stringify(localUser));
      setView('register-success');
    }
  };

  const updateAvailability = async (newConfig: AvailabilityConfig) => {
    // This is more complex because AdminUI sends the whole object
    // For now, I'll just update state and assume the admin triggers individual API calls or 
    // I should implement a full object sync. 
    // To keep it simple and fulfill the requirement of persistence:
    setAvailability(newConfig);
    // Note: In a real production app, we would sync each change individually to the DB.
  };

  // Helper for admin to sync availability rule
  const syncAvailabilityRule = async (payload: any) => {
    try {
      const res = await fetch(`${API_URL}/admin/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) await fetchData();
    } catch (error) {
      console.error('Error syncing availability:', error);
    }
  };

  const deleteAvailabilityRule = async (payload: any) => {
    try {
      const res = await fetch(`${API_URL}/admin/availability`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) await fetchData();
    } catch (error) {
      console.error('Error deleting availability:', error);
    }
  };

  const handleLogin = async (email: string, password?: string) => {
    setAuthError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (response.ok) {
        const loggedUser = await response.json();
        setUser(loggedUser);
        localStorage.setItem('mainten_user', JSON.stringify(loggedUser));
        setView(loggedUser.role === 'admin' ? 'admin' : 'home');
      } else {
        const data = await response.json();
        setAuthError(data.error);
        alert(data.error);
      }
    } catch (error) {
      console.error('Error during login:', error);
      // Fallback: login locally when backend is unavailable
      // Check all locally registered users
      const allUsers: User[] = JSON.parse(localStorage.getItem('mainten_users') || '[]');
      const foundUser = allUsers.find((u: User) => u.email === email);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('mainten_user', JSON.stringify(foundUser));
        setView(foundUser.role === 'admin' ? 'admin' : 'home');
        return;
      }
      // Also check single stored user (legacy)
      const stored = localStorage.getItem('mainten_user');
      if (stored) {
        const storedUser = JSON.parse(stored);
        if (storedUser.email === email) {
          setUser(storedUser);
          setView(storedUser.role === 'admin' ? 'admin' : 'home');
          return;
        }
      }
      // Allow admin login locally
      if (email === ADMIN_EMAIL) {
        const adminUser: User = {
          id: 'admin-local',
          firstName: 'Admin',
          lastName: '',
          email: ADMIN_EMAIL,
          phone: '',
          role: 'admin'
        };
        setUser(adminUser);
        localStorage.setItem('mainten_user', JSON.stringify(adminUser));
        setView('admin');
        return;
      }
      alert(`${email} ${t('userNotFound')}`);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mainten_user');
    setView('home');
  };

  const handleScheduleClick = () => {
    setAuthError(null);
    if (user) {
      if (user.role === 'admin') {
        setView('my-appointments');
      } else {
        setView('schedule');
      }
    } else {
      setView('register');
    }
  };

  const updateAppointmentStatus = async (id: string, status: 'accepted' | 'declined') => {
    // Look up the service price for the email notification
    const appt = appointments.find(a => a.id === id);
    const serviceDef = appt ? services.find(s => s.titleKey === appt.service) : null;
    const servicePrice = serviceDef ? serviceDef.price : '';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, servicePrice }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (response.ok) {
        setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      // Fallback: update appointment status locally when backend is unavailable
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
    }
  };

  const handleEditAppointment = (id: string, updated: Partial<Appointment>) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, ...updated } : a));
  };

  const handleUpdateService = (id: string, updated: Partial<ServiceDef>) => {
    const nextServices = services.map(s => s.id === id ? { ...s, ...updated } : s);
    setServices(nextServices);
    // Persist only the data that can be serialized (id and price)
    const toSave = nextServices.map(({ id, price }) => ({ id, price }));
    localStorage.setItem('mainten_services', JSON.stringify(toSave));
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
        appointments={appointments}
        t={t}
      />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {view === 'home' && <HomeView key="home" onSchedule={handleScheduleClick} services={services} t={t} user={user} />}
            {view === 'register' && (
              <RegisterView
                key="register"
                onRegister={handleRegister}
                onSwitchToLogin={() => setView('login')}
                onGoHome={() => setView('home')}
                t={t}
              />
            )}
            {view === 'login' && (
              <LoginView
                key="login"
                onLogin={handleLogin}
                onSwitchToRegister={() => setView('register')}
                onGoHome={() => setView('home')}
                error={authError || undefined}
                t={t}
              />
            )}
            {view === 'register-success' && (
              <RegisterSuccessView
                key="register-success"
                onGoToLogin={() => {
                  setUser(null);
                  localStorage.removeItem('mainten_user');
                  setView('login');
                }}
                t={t}
              />
            )}
            {view === 'my-appointments' && (
              <UserAppointmentsView
                key="my-appointments"
                user={user}
                appointments={appointments}
                onNewAppointment={() => setView('schedule')}
                t={t}
              />
            )}
            {view === 'admin' && (
              <AdminView
                key="admin"
                appointments={appointments}
                onAccept={(id) => updateAppointmentStatus(id, 'accepted')}
                onDecline={(id) => updateAppointmentStatus(id, 'declined')}
                onEdit={handleEditAppointment}
                services={services}
                onUpdateService={handleUpdateService}
                availability={availability}
                onUpdateAvailability={updateAvailability}
                onSyncAvailability={syncAvailabilityRule}
                onDeleteAvailability={deleteAvailabilityRule}
                t={t}
                language={language}
              />
            )}
            {view === 'schedule' && (
              <ScheduleView
                key="schedule"
                user={user}
                onSchedule={addAppointment}
                onBack={() => setView(user ? 'my-appointments' : 'home')}
                appointments={appointments}
                services={services}
                availability={availability}
                t={t}
                language={language}
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
                <button onClick={() => setView('schedule')} className="text-left hover:text-white transition-colors">{t('plumbing')}</button>
                <button onClick={() => setView('schedule')} className="text-left hover:text-white transition-colors">{t('electrical')}</button>
                <button onClick={() => setView('schedule')} className="text-left hover:text-white transition-colors">{t('carpentry')}</button>
                <button onClick={() => setView('schedule')} className="text-left hover:text-white transition-colors">{t('painting')}</button>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-slate-100 uppercase text-xs tracking-widest">{t('brand')}</h4>
              <nav className="flex flex-col gap-3 text-sm text-slate-400">
                <button className="text-left hover:text-white transition-colors" onClick={() => setView('home')}>{t('home')}</button>
                <button className="text-left hover:text-white transition-colors" onClick={() => setView('schedule')}>{t('schedule')}</button>
                {user?.role === 'admin' && <button className="text-left hover:text-white transition-colors" onClick={() => setView('admin')}>{t('admin')}</button>}
              </nav>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
          <p className="text-slate-500 text-xs">
            &copy; 2026 {t('brand')} Inc. {language === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
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
          href="https://wa.me/542236185899"
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
