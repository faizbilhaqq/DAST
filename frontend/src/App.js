import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react'
import Dash from './pages/dashboard';
import Upload from './pages/uploadJSON';
import Loading from './pages/loadingPage';
import ErrorPage from './pages/errorPage';




function App() {
  return (
    <ChakraProvider>
    <Router>
    <div className="App">
      <div className="content">
        
        <Routes>
        <Route path='/' element={<Dash/>}   />
        <Route path='/uploadJSON' element={<Upload/>}   />
        <Route path='/loading' element={<Loading/>}   />
        <Route path='/errorPage' element={<ErrorPage/>}   />



        </Routes>
      </div>
      
    </div>
    </Router>
    </ChakraProvider>
  );
}

export default App;
