import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import AdminDashboard from './features/admin/AdminDashboard';
import PrivacyNotice from './features/privacy/PrivacyNotice';
import './app/App.css';
import './features/practice/practice.css';
import './features/admin/admin.css';

// hash-based routing, nothing fancy
function Router() {
  const [route, setRoute] = React.useState(window.location.hash);

  React.useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route === '#admin') {
    return <AdminDashboard />;
  }
  if (route === '#privacy') {
    return <PrivacyNotice />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
