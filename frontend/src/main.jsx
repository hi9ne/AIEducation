import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { Provider } from 'react-redux'
import { store } from './store/index.js'
import App from './App.jsx'
import './index.css'
import ThemeProvider from './components/Theme/ThemeProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <MantineProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MantineProvider>
    </Provider>
  </React.StrictMode>,
)
