import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [authed, setAuthed] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!authed ? (
        <LoginPage key="login" onLogin={() => setAuthed(true)} />
      ) : (
        <Dashboard key="dashboard" onLogout={() => setAuthed(false)} />
      )}
    </AnimatePresence>
  );
}
