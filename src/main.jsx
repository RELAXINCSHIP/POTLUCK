import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import LandingPage from './LandingPage'
import PitchPage from './PitchPage'
import './index.css'

function Router() {
    const [route, setRoute] = useState(window.location.hash || '#/')

    useEffect(() => {
        const onHash = () => setRoute(window.location.hash || '#/')
        window.addEventListener('hashchange', onHash)
        return () => window.removeEventListener('hashchange', onHash)
    }, [])

    const navigate = (hash) => {
        window.location.hash = hash
    }

    if (route === '#/app') {
        return <App />
    }

    if (route === '#/pitch') {
        return <PitchPage onBack={() => navigate('#/')} />
    }

    // Default: landing page
    return <LandingPage onGoToApp={() => navigate('#/app')} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Router />
    </React.StrictMode>,
)
