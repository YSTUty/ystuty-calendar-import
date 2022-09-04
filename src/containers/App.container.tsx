import { Route, Routes } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import GitHubIcon from '@mui/icons-material/GitHub';
import EventNoteIcon from '@mui/icons-material/EventNote';

import { ThemeModeButton } from '../providers/ThemeMode.provider';
import MainPageContainer from './MainPage.container';
import VersionComponent from '../components/Version.component';
import * as envUtils from '../utils/env.utils';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

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
                    <Typography variant="h6" color="inherit" noWrap>
                        [YSTUty] <b>I</b>mport <b>C</b>alendar <b>S</b>chedule
                    </Typography>
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
