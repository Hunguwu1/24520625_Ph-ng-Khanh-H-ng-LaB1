import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './style.css'

const container = document.getElementById('app')

if (!container) {
  throw new Error('Không tìm thấy phần tử #app')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
