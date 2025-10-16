import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { UserContextProvider } from './context/UserContext';
import { ChartContextProvider, TimeFrameProvider } from './context/ChartContext';
import { ToastContextProvider } from './context/ToastContext';
import { router } from './router';
import Toast from './components/ui/Toast';

function App() {
  return (
    <UserContextProvider>
      <ChartContextProvider>
        <TimeFrameProvider>
          <ToastContextProvider>
            <RouterProvider router={router} />
            <Toast />
          </ToastContextProvider>
        </TimeFrameProvider>
      </ChartContextProvider>
    </UserContextProvider>
  );
}

export default App;
