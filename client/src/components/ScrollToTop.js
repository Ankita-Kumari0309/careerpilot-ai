import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AppThemeProvider>
      <Router>
        <RouteLoader />
        <ScrollToTop />
        <Routes>
          {/* ...unchanged... */}
        </Routes>
      </Router>
    </AppThemeProvider>
  );
}