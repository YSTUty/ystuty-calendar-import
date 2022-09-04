import { Route, Routes } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import GitHubIcon from '@mui/icons-material/GitHub';

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
                elevation={0}
                sx={{
                    position: 'relative',
                    borderBottom: (t) => `1px solid ${t.palette.divider}`,
                }}
            >
                <Toolbar>
                    <Typography variant="h6" color="inherit" noWrap>
                        [YSTUty] <b>I</b>mport <b>C</b>alendar <b>S</b>chedule
                    </Typography>
                    <FormControl sx={{ pl: 1 }}>
                        <ThemeModeButton />
                    </FormControl>
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
