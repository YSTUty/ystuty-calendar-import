import styled from '@mui/styled-engine';
import { FormattedDate } from 'react-intl';
import { buildAppVersion, buildTimestamp } from '../utils/app-version.util';

const Version = () => (
    <span style={{ fontSize: '0.6rem', color: '#9e9e9e' }} title={new Date(buildTimestamp).toLocaleString()}>
        [{buildAppVersion.v}]{' ('}
        <FormattedDate month="2-digit" day="2-digit" hour="2-digit" minute="2-digit" value={new Date(buildTimestamp)} />
        )
    </span>
);

export default Version;
