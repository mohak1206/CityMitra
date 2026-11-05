import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LogIn,
  MapPin,
  Shield,
  Sparkles,
  ArrowRight,
  Zap,
  Users,
  CheckCircle2,
} from "lucide-react";
import { localDB } from "../services/localStorage";
import { isAdmin } from "../utils/userUtils";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

// Premium animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const floatVariants = {
  animate: {
    y: [0, -15, 0],
    rotate: [0, 2, -2, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Demo user for local testing (admin access controlled by whitelist in userUtils.js)
const DEMO_USERS = [
  { email: "user@smartcity.com", name: "Demo User", isAdmin: false },
];

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const currentUser = localDB.getCurrentUser();
    if (currentUser) {
      if (isAdmin(currentUser)) {
        navigate("/dashboard");
      } else {
        navigate("/report");
      }
    }
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Simulate login delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      const user = {
        uid: "local_" + Date.now(),
        email: email.trim(),
        displayName: name.trim() || email.trim().split("@")[0],
        photoURL: null,
      };
      localDB.setCurrentUser(user);
      if (isAdmin(user)) {
        navigate("/dashboard");
      } else {
        navigate("/report");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if popup is blocked
      const testPopup = window.open("", "_blank", "width=1,height=1");
      if (!testPopup || testPopup.closed || typeof testPopup.closed === "undefined") {
        throw new Error("Popup blocked! Please allow popups for this site and try again.");
      }
      testPopup.close();

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      if (!firebaseUser) {
        throw new Error("No user data received from Google");
      }

      const user = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || "User",
        photoURL: firebaseUser.photoURL,
      };
      
      localDB.setCurrentUser(user);
      console.log("Login successful:", user.email, "Admin:", isAdmin(user));
      
      if (isAdmin(user)) {
        navigate("/dashboard");
      } else {
        navigate("/report");
      }
    } catch (err) {
      console.error("Login error:", err);
      
      // Better error messages
      let errorMessage = err.message;
      if (err.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked! Please allow popups and try again.";
      } else if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in cancelled. Please try again.";
      } else if (err.code === "auth/unauthorized-domain") {
        errorMessage = "This domain is not authorized. Please use localhost or an authorized domain.";
      } else if (err.code === "auth/cancelled-popup-request") {
        errorMessage = "Multiple sign-in attempts detected. Please try again.";
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-cream-dark to-cream" />

      {/* Animated mesh gradient */}
      <motion.div
        animate={{
          background: [
            "radial-gradient(circle at 20% 80%, rgba(232, 77, 28, 0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(232, 77, 28, 0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 40%, rgba(232, 77, 28, 0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 80%, rgba(232, 77, 28, 0.08) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      />

      {/* Blueprint grid - more visible */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0"
        style={{
          backgroundImage: `
                        linear-gradient(#3B7DD8 1.5px, transparent 1.5px),
                        linear-gradient(90deg, #3B7DD8 1.5px, transparent 1.5px)
                    `,
          backgroundSize: "60px 60px",
          opacity: 0.15,
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, black 0%, transparent 70%)",
        }}
      />

      {/* Premium floating orbs */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-accent/15 to-accent/5 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
        className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blueprint/15 to-blueprint/5 rounded-full blur-[80px]"
      />

      {/* Floating geometric shapes */}
      <motion.div
        variants={floatVariants}
        animate="animate"
        className="absolute top-20 left-[15%] w-16 h-16 border-2 border-accent/40 rotate-45"
      />
      <motion.div
        variants={floatVariants}
        animate="animate"
        style={{ animationDelay: "2s" }}
        className="absolute bottom-32 right-[10%] w-24 h-24 border-2 border-blueprint/40"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/3 right-[8%] w-20 h-20 border-2 border-slate/20"
      />

      {/* Corner frames - more prominent */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: -30 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-12 left-12 w-40 h-40 border-t-2 border-l-2 border-slate/40"
      />
      <motion.div
        initial={{ opacity: 0, x: 30, y: 30 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-12 right-12 w-40 h-40 border-b-2 border-r-2 border-slate/40"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-lg"
      >
        {/* Card with premium layered design */}
        <div className="relative">
          {/* Background shadow layer */}
          <div className="absolute -inset-1 bg-slate/5 blur-xl" />

          {/* Outer geometric frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute -inset-6 border border-slate/25"
          />

          {/* Animated corner accents */}
          {[
            {
              pos: "-top-6 -left-6",
              border: "border-t-2 border-l-2",
              delay: 0.4,
            },
            {
              pos: "-top-6 -right-6",
              border: "border-t-2 border-r-2",
              delay: 0.5,
            },
            {
              pos: "-bottom-6 -left-6",
              border: "border-b-2 border-l-2",
              delay: 0.6,
            },
            {
              pos: "-bottom-6 -right-6",
              border: "border-b-2 border-r-2",
              delay: 0.7,
            },
          ].map((corner, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: corner.delay,
                type: "spring",
                stiffness: 200,
              }}
              className={`absolute ${corner.pos} w-10 h-10 ${corner.border} border-accent`}
            />
          ))}

          <motion.div
            variants={itemVariants}
            className="bg-cream/95 backdrop-blur-xl border border-cream-muted shadow-2xl p-10 md:p-12 relative overflow-hidden"
          >
            {/* Top gradient accent */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent to-blueprint origin-left"
            />

            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231A2332' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            {/* Logo with animation */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center mb-10"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-16 h-16 bg-slate flex items-center justify-center shadow-xl"
                >
                  <MapPin className="w-8 h-8 text-cream" strokeWidth={2} />
                  {/* Pulse ring */}
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 border-2 border-accent"
                  />
                </motion.div>
                <div>
                  <span className="font-display font-bold text-3xl text-slate tracking-tight">
                    SmartCity
                  </span>
                  <span className="block text-xs font-display uppercase tracking-[0.3em] text-accent font-semibold">
                    Reporter
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center mb-10">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-slate mb-4 tracking-tight">
                Welcome Back
              </h1>
              <p className="font-body text-slate-muted text-lg leading-relaxed max-w-sm mx-auto">
                Sign in to report issues and track city improvements in
                real-time.
              </p>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mb-8 p-4 bg-danger/10 border-l-4 border-danger text-danger font-display text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded border border-cream-muted focus:outline-none focus:ring-2 focus:ring-accent text-slate bg-cream"
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded border border-cream-muted focus:outline-none focus:ring-2 focus:ring-accent text-slate bg-cream"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded bg-accent text-cream font-display font-bold text-lg uppercase tracking-wider hover:bg-accent-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign in
                  </>
                )}
              </button>
            </form>
            <div className="my-6 text-center">
              <span className="text-slate-muted text-sm font-body">Or</span>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded bg-slate text-cream font-display font-bold text-lg uppercase tracking-wider hover:bg-slate-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Sign in with Google
                </>
              )}
            </button>

            {/* Demo Login - Fallback if Google fails */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  // Quick demo login without form
                  const demoEmail = email || "demo@smartcity.com";
                  const demoName = name || "Demo User";
                  const user = {
                    uid: "local_" + Date.now(),
                    email: demoEmail,
                    displayName: demoName,
                    photoURL: null,
                  };
                  localDB.setCurrentUser(user);
                  if (isAdmin(user)) {
                    navigate("/dashboard");
                  } else {
                    navigate("/report");
                  }
                }}
                disabled={loading}
                className="text-sm text-slate-muted hover:text-slate underline transition-colors"
              >
                Or try Quick Demo Login (no Google required)
              </button>
            </div>

            {/* Stats row */}
            <motion.div
              variants={itemVariants}
              className="mt-8 pt-8 border-t border-cream-muted grid grid-cols-3 gap-4 text-center"
            >
              {[
                { value: "10K+", label: "Reports" },
                { value: "500+", label: "Fixed" },
                { value: "4.9★", label: "Rating" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="font-display text-2xl font-bold text-slate">
                    {stat.value}
                  </div>
                  <div className="font-body text-xs text-slate-muted uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-center font-body text-sm text-slate-muted mt-8"
            >
              By signing in, you agree to help make your city better.
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
