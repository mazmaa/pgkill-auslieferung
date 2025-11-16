import { useState } from 'react'
import './App.css'
import Pipeline from './components/pipeline/Pipeline'
import Settings from './components/settings/Settings'
import Outputs from './components/outputs/Outputs'
import { AppContextProvider } from './context/AppContextProvider'
import { ReactNotifications } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import 'animate.css/animate.min.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ReactNotifications />
      <AppContextProvider>
        <h1 className='flex justify-center p-6 font-bold'>PGKILL</h1>
        <div className='flex h-fit w-screen justify-center'>
          <div className='flex flex-col w-screen justify-center gap-6 max-w-7xl'>
            <Pipeline />
            <Settings />
            <Outputs />
          </div>
        </div>
      </AppContextProvider>
    </>
  )
}

export default App
