import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
 
import { FormattedMessage } from 'react-intl';

const MainPage = () => {
    return (
        <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
            <Typography component="h1" variant="h4" align="center">
                <FormattedMessage id="page.main.title" />
            </Typography>
            <>
                {/* // TODO: add selecting schedule */}
                <Typography variant="h5">
                    <FormattedMessage id="page.main.subtitle" />
                </Typography>
                <Typography>
                    <FormattedMessage id="page.main.description" />
                </Typography>
            </>
        </Paper>
    );
};

export default MainPage;
