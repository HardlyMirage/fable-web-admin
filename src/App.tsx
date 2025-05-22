import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/auth-context';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UniversitiesList from './pages/universities/UniversitiesList';
import UniversityForm from './pages/universities/UniversityForm';
import CoursesList from './pages/courses/CoursesList';
import CourseForm from './pages/courses/CourseForm';
import EventsList from './pages/events/EventsList';
import EventForm from './pages/events/EventForm';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AuthenticatedRoutes: React.FC = () => (
  <ProtectedRoute>
    <MainLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/universities" element={<UniversitiesList />} />
        <Route path="/universities/new" element={<UniversityForm />} />
        <Route path="/universities/:id" element={<UniversityForm />} />
        
        <Route path="/courses" element={<CoursesList />} />
        <Route path="/courses/new" element={<CourseForm />} />
        <Route path="/courses/:id" element={<CourseForm />} />
        
        <Route path="/events" element={<EventsList />} />
        <Route path="/events/new" element={<EventForm />} />
        <Route path="/events/:id" element={<EventForm />} />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  </ProtectedRoute>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AuthenticatedRoutes />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
