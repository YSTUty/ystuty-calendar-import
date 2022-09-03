import styled from '@mui/styled-engine';
import { FormattedDate } from 'react-intl';
import { buildAppVersion, buildTimestamp } from '../utils/app-version.util';

const StyledDate = styled('div')(() => ({
    display: 'inline',
    // '@media (max-width: 540px)': {
    //     display: 'none',
    // },
}));

const VersionComponent = () => (
    <div style={{ fontSize: '0.6rem', color: '#9e9e9e' }}>
        [{buildAppVersion.v}]
        <StyledDate>
            {' ('}
            <FormattedDate
                month="2-digit"
                day="2-digit"
                hour="2-digit"
                minute="2-digit"
                value={new Date(buildTimestamp)}
            />
            )
        </StyledDate>
    </div>
);

export default VersionComponent;
