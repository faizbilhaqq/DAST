import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react'
import Dash from './pages/dashboard';
import Upload from './pages/uploadJSON';




function App() {
  return (
    <ChakraProvider>
    <Router>
    <div className="App">
      <div className="content">
        
        <Routes>
        <Route path='/' element={<Dash/>}   />
        <Route path='/uploadJSON' element={<Upload/>}   />


        </Routes>
      </div>
      
    </div>
    </Router>
    </ChakraProvider>
  );
}

export default App;
