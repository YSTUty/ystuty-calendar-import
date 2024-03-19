import { Route, Routes } from 'react-router-dom';

import VK, { Like } from '../components/VK';

import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';

import GitHubIcon from '@mui/icons-material/GitHub';
import TelegramIcon from '@mui/icons-material/Telegram';
import SupportAgentIcon from '@mui/icons-material/SupportAgentSharp';
import EventNoteIcon from '@mui/icons-material/EventNote';

import { ThemeModeButton } from '../providers/ThemeMode.provider';
import MainPageContainer from './MainPage.container';
import VersionComponent from '../components/Version.component';
import * as envUtils from '../utils/env.utils';

const Copyright = () => {
    return (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ pt: 3 }}>
            {'Copyright © '}
            2018-{new Date().getFullYear()}{' '}
            {envUtils.linkYSTUty ? (
                <Link href={envUtils.linkYSTUty} color="inherit">
                    YSTUty
                </Link>
            ) : (
                'YSTUty'
            )}
            {'.'}
            {envUtils.linkToGitHub && (
                <Link href={envUtils.linkToGitHub} target="_blank" color="inherit" sx={{ ml: 1 }}>
                    <GitHubIcon fontSize="small" />
                </Link>
            )}
            {envUtils.linkToGitHub && envUtils.telegramUsername && ' '}
            {envUtils.telegramUsername && (
                <Link href={`https://t.me/${envUtils.telegramUsername}`} target="_blank" color="inherit" sx={{ ml: 1 }}>
                    <TelegramIcon fontSize="small" />
                </Link>
            )}
            {envUtils.linkToSupport && (
                <Link
                    href={envUtils.linkToSupport}
                    target="_blank"
                    sx={{ ml: 1 }}
                    color="inherit"
                    title="Поддержка/Задать вопрос/Что-нибудь предложить"
                >
                    <SupportAgentIcon />
                </Link>
            )}
            <br />
            <VersionComponent />
        </Typography>
    );
};

const App = () => {
    return (
        <>
            <AppBar
                position="absolute"
                color="default"
                elevation={5}
                sx={{
                    position: 'relative',
                    borderBottom: (t) => `1px solid ${t.palette.divider}`,
                }}
            >
                <Toolbar>
                    <Typography variant="h6" color="inherit" noWrap sx={{ mr: 2 }}>
                        [YSTUty] <b>I</b>mport <b>C</b>alendar <b>S</b>chedule
                    </Typography>
                    {envUtils.vkWidgetsApiId && (
                        <>
                            <Divider orientation="vertical" flexItem />
                            <FormControl sx={{ ml: 2 }}>
                                <VK apiId={envUtils.vkWidgetsApiId} options={{ version: 168, onlyWidgets: true }}>
                                    <Like
                                        elementId="vk_like"
                                        options={{ type: 'mini', height: 24, width: 1000, verb: 0 }}
                                        pageId={'ics'}
                                        onLike={(num) => {}}
                                        onUnlike={(num) => {}}
                                        onShare={(num) => {}}
                                        onUnshare={(num) => {}}
                                    />
                                </VK>
                            </FormControl>
                        </>
                    )}
                    <Typography sx={{ flex: 1 }}></Typography>
                    <Divider orientation="vertical" flexItem />
                    <FormControl>
                        <ThemeModeButton />
                    </FormControl>
                    {envUtils.linkToScheduleViewer && (
                        <>
                            <Divider orientation="vertical" flexItem />
                            <FormControl>
                                <Link href={envUtils.linkToScheduleViewer} color="inherit">
                                    <IconButton>
                                        <EventNoteIcon />
                                    </IconButton>
                                    Schedule
                                </Link>
                            </FormControl>
                        </>
                    )}
                </Toolbar>
            </AppBar>
            <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
                <Routes>
                    <Route path="/" element={<MainPageContainer />} />
                    {/* <Route path="about" element={<About />} /> */}
                </Routes>
                <Copyright />
            </Container>
        </>
    );
};

export default App;
