import { Route, Routes } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';

import EventNoteIcon from '@mui/icons-material/EventNote';

import VK, { Like } from '../components/VK';
import Copyright from '../components/Copyright.component';

import { ThemeModeButton } from '../providers/ThemeMode.provider';
import MainPageContainer from './MainPage.container';
import * as envUtils from '../utils/env.utils';

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
