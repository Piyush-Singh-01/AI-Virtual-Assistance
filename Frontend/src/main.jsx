import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer, Bounce} from 'react-toastify';
import {Provider} from "react-redux"
import store from './redux/store.jsx'


createRoot(document.getElementById('root')).render(
 <BrowserRouter>
    <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
)
