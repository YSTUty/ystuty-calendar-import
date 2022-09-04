import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import DateRangeIcon from '@mui/icons-material/DateRange';

import GroupSelectComponent from '../components/GroupSelect.component';
import TeacherSelectComponent, { getTeachers } from '../components/TeacherSelect.component';
import HtmlTooltip from '../components/HtmlTooltip.component';

import * as envUtils from '../utils/env.utils';
import { RootState } from '../store';

import googleCalendarImage from '../assets/images/google-calendar-1.png';

const linksToServices = [
    {
        href: 'https://calendar.google.com/calendar/u/0/r/settings/addbyurl',
        icon: <GoogleIcon />,
        title: 'Google',
        img: googleCalendarImage,
    },
    {
        href: 'https://yandex.ru/support/calendar/common/create.html#import',
        icon: <DateRangeIcon />,
        title: 'Yandex',
    },
    {
        href:
            'https://support.apple.com/ru-ru/guide/iphone/iph3d1110d4/ios#' +
            ':~:text=Подписка%20на%20внешний%20календарь%2C%20доступный,%2C%20затем%20коснитесь%20«Подписаться».',
        icon: <AppleIcon />,
        title: 'Apple (iPhone)',
    },
    {
        href: 'https://outlook.office.com/calendar/addcalendar',
        icon: <InsertInvitationIcon />,
        title: 'Outlook (MS Office)',
    },
];

// Инструкция по импорту в Apple Calendar: https://support.apple.com/ru-ru/HT202361
// Инструкция по импорту в Google Calendar: https://support.google.com/calendar/answer/37118?hl=ru
// Инструкция по импорту в Yandex Calendar: https://yandex.ru/support/calendar/common/create.html#import

const MainPage = () => {
    const { selectedGroups, selectedTeachers } = useSelector<RootState, RootState['schedule']>(
        (state) => state.schedule
    );
    const teachers = getTeachers();

    return (
        <>
            <Paper sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <Typography component="h1" variant="h4" align="center">
                    <FormattedMessage id="page.main.title" />
                </Typography>
                <Typography variant="h5">
                    <FormattedMessage id="page.main.subtitle" />
                </Typography>
                <Typography sx={{ mt: 2 }}>
                    <FormattedMessage id="page.main.description" />
                </Typography>
                <Grid container spacing={1} sx={{ mt: 2 }} alignItems="center" justifyContent="center">
                    {linksToServices.map((e) => (
                        <Grid item xs="auto" key={e.title}>
                            <Link display="block" variant="body1" href={e.href} target="_blank" sx={{ mb: 0.5 }}>
                                <HtmlTooltip
                                    title={
                                        e.img ? (
                                            <>
                                                <Typography color="inherit">Example</Typography>
                                                <img src={e.img} width={800} />
                                            </>
                                        ) : (
                                            false
                                        )
                                    }
                                    disableHoverListener={!e.img}
                                >
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {e.icon}
                                        <span>{e.title}</span>
                                    </Stack>
                                </HtmlTooltip>
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            <Paper sx={{ my: 1, p: { xs: 2, md: 3 } }}>
                <Typography sx={{ fontSize: 14 }}>
                    <FormattedMessage id="page.main.sync-info" />
                </Typography>
            </Paper>

            <Card sx={{ mt: 2 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                        <FormattedMessage id="text.groups" />
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} md={12}>
                            <GroupSelectComponent /* allowMultipleGroupsRef={allowMultipleGroupsRef} */ />
                        </Grid>

                        {selectedGroups.map((group) => (
                            <Grid item xs={12} md={12} key={group}>
                                <TextField
                                    fullWidth
                                    label={<FormattedMessage id="text.group.param" values={{ group }} />}
                                    variant="filled"
                                    color="success"
                                    focused
                                    value={`${envUtils.apiPath}/calendar/group/${group}.ical`}
                                    onClick={(e) => {
                                        (e.target as any).select();
                                    }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                    {selectedGroups.length > 0 && (
                        <Typography sx={{ mt: 2, fontSize: 12 }}>
                            <FormattedMessage id="page.main.group.apple-info" />
                        </Typography>
                    )}
                </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                        <FormattedMessage id="text.teachers" />
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} md={12}>
                            <TeacherSelectComponent /* allowMultipleTeachersRef={allowMultipleTeachersRef} */ />
                        </Grid>

                        {selectedTeachers.map((teacherId) => (
                            <Grid item xs={12} md={12} key={teacherId}>
                                <TextField
                                    fullWidth
                                    label={
                                        <FormattedMessage
                                            id="text.teacher.param"
                                            values={{ teacher: teachers?.find((t) => t.id === teacherId)?.name }}
                                        />
                                    }
                                    variant="filled"
                                    color="secondary"
                                    focused
                                    value={`${envUtils.apiPath}/calendar/teacher/${teacherId}.ical`}
                                    onClick={(e) => {
                                        (e.target as any).select();
                                    }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        </>
    );
};

export default MainPage;
