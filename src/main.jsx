import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AthleteApp from './AthleteApp'

// Coach builder stays at "/" (unchanged, no login). Athlete portal at "/athlete".
const athleteMode = window.location.pathname.startsWith('/athlete')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {athleteMode ? <AthleteApp /> : <App />}
  </React.StrictMode>
)
