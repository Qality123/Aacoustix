import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SplashPage } from './pages/SplashPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Trending } from './pages/Trending';
import { New } from './pages/New';
import { Artists } from './pages/Artists';
import { Charts } from './pages/Charts';
import { Recommended } from './pages/Recommended';
import { Library } from './pages/Library';
import { Artist } from './pages/Artist';
import { Album } from './pages/Album';
import { Genre } from './pages/Genre';
import { Playlists } from './pages/Playlists';
import { PlaylistDetail } from './pages/PlaylistDetail';
import { LikedSongs } from './pages/LikedSongs';
import { Profile } from './pages/Profile';
import { Recent } from './pages/Recent';
import { BecomeArtist } from './pages/BecomeArtist';
import { ArtistDashboardPage } from './pages/ArtistDashboard';
import { Archived } from './pages/Archived';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <Routes>
            <Route path="/" element={<SplashPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/home" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/new" element={<New />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/recommended" element={<Recommended />} />
              <Route path="/genre/:name" element={<Genre />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlist/:id" element={<PlaylistDetail />} />
              <Route path="/artist/:id" element={<Artist />} />
              <Route path="/album/:id" element={<Album />} />
              <Route path="/library" element={<Library />} />
              <Route path="/liked" element={<LikedSongs />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/recent" element={<Recent />} />
              <Route path="/archived" element={<Archived />} />
              <Route path="/become-artist" element={<BecomeArtist />} />
              <Route path="/artist-dashboard" element={<ArtistDashboardPage />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Route>
          </Routes>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
