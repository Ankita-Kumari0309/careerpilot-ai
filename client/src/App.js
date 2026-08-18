import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AppThemeProvider } from './theme/ThemeContext';
import RouteLoader from './components/RouteLoader';

import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SignUp from './pages/SignUp';

import Upload from './pages/Upload';
import Result from './pages/Result';
import Record from './pages/Records';
import Welcome from './pages/Welcome';
import JobSearch from './pages/JobSearch';
import MyJobs from './pages/MyJobs';
import InterviewPrep from './pages/InterviewPrep'; 
import InterviewRoom from './pages/InterviewRoom';

import Layout from './components/Layout';
import FAQ from './components/FAQ';
import CreatorDeskPage from './components/CreatorDeskPage';

function App() {
  return (
    <AppThemeProvider>
      <Router>
        <RouteLoader />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/creator-desk" element={<CreatorDeskPage />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/upload" element={<Upload />} />
            <Route path="/records" element={<Record />} />
            <Route path="/result" element={<Result />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/jobsearch" element={<JobSearch />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route path="/interview-prep" element={<InterviewPrep />} />
            <Route path="/interview-room" element={<InterviewRoom />} />
          </Route>
        </Routes>
      </Router>
    </AppThemeProvider>
  );
}

export default App;