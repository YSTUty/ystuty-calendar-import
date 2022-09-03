import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/roboto/500.css';

import Localizer from './providers/Localizer.provider';
import { ThemeModeProvider } from './providers/ThemeMode.provider';
import App from './containers/App.container';
import YandexMetrikaComponent from './components/YandexMetrika.component';

import reportWebVitals from './reportWebVitals';
import store from './store';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <Localizer>
                <ThemeModeProvider>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </ThemeModeProvider>
                <YandexMetrikaComponent />
            </Localizer>
        </Provider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

