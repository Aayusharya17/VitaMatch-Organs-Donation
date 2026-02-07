import { Route,Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DonorDashboard from './pages/DonorDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import LearnMore from "./pages/LearnMore";

function App() {
  return (
    <div >
      <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/donor-dashboard' element={<DonorDashboard/>}></Route>
        <Route path='/doctor-dashboard' element={<DoctorDashboard/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/signup' element={<Signup/>}></Route>
        <Route path="/learn-more" element={<LearnMore />} />
      </Routes>
    </div>
  );
}

export default App;
