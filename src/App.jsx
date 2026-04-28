import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import ShellLayout from './layouts/ShellLayout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import NeedsQueue from './pages/NeedsQueue';
import TaskTracker from './pages/TaskTracker';
import VolunteerManagement from './pages/VolunteerManagement';
import IntakeForm from './pages/IntakeForm';

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/report" element={<IntakeForm />} />

          {/* Protected routes in Shell */}
          <Route element={<ShellLayout />}>
            <Route path="/dashboard" element={<NeedsQueue />} />
            <Route path="/tasks" element={<TaskTracker />} />
            <Route path="/volunteers" element={<VolunteerManagement />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
