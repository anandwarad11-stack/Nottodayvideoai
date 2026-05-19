import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomTabs from './components/BottomTabs';
import CreatePage from './pages/CreatePage';
import LibraryPage from './pages/LibraryPage';
import AccountPage from './pages/AccountPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreatePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <BottomTabs />
    </BrowserRouter>
  );
}
