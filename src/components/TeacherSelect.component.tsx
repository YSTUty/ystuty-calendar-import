import React from 'react';
import { useHash, useNetworkState } from 'react-use';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import store2 from 'store2';

import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Popper, { PopperProps } from '@mui/material/Popper';
import { styled } from '@mui/material/styles';

import scheduleSlice, { getLastTeachers, STORE_TEACHER_NAME_KEY } from '../store/reducer/schedule/schedule.slice';
import * as envUtils from '../utils/env.utils';
import { RootState } from '../store';

interface ITeacherData {
    name: string;
    id: number;
}

const STORE_CACHED_TEACHERS_KEY = 'cachedTeachers';
export const getTeachers = () => store2.get(STORE_CACHED_TEACHERS_KEY, null) as ITeacherData[] | null;

const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        '& ul': { margin: 0 },
        '& li': { margin: 0 },
    },
});

const MyPopper = (props: PopperProps) => <StyledPopper {...props} style={{ width: 350 }} />;

const TeacherSelect = (props: { allowMultipleTeachersRef?: React.MutableRefObject<(state?: any) => void> }) => {
    const { allowMultipleTeachersRef } = props;
    const dispatch = useDispatch();
    const { selectedTeachers: selected, allowedMultipleTeachers: allowedMultiple } = useSelector<
        RootState,
        RootState['schedule']
    >((state) => state.schedule);
    const { online, previous: previousOnline, since } = useNetworkState();

    const { formatMessage } = useIntl();

    const [teachers, setTeachers] = React.useState<ITeacherData[]>([]);
    const [fetching, setFetching] = React.useState(false);
    const [isCached, setIsCached] = React.useState(false);

    const [hash, setHash] = useHash();
    const defaultValues: number[] = React.useMemo(() => {
        const teacherIds = getLastTeachers();
        let values = ((e) =>
            e
                ?.split(',')
                .map<number>((e) => Number(e))
                .filter((e) => e > 0) || [])(decodeURI(hash.slice(1)));
        values = values.length > 0 ? values : teacherIds;
        // store2.set(STORE_TEACHER_NAME_KEY, values[0]);
        return values;
    }, [hash, teachers]);

    const applyTeachers = React.useCallback(
        (items: ITeacherData[] | null) => {
            if (!items) {
                items = getTeachers();
                if (!items) {
                    return;
                }
                setIsCached(true);
            } else if (items.length > 0) {
                store2.set(STORE_CACHED_TEACHERS_KEY, items);
                setIsCached(false);
            }

            // items.sort();
            setTeachers(items);
        },
        [setTeachers, setIsCached],
    );

    const loadTeachersList = React.useCallback(() => {
        if (fetching) {
            return;
        }

        setFetching(true);

        fetch(`${envUtils.apiPath}/ystu/schedule/teachers`)
            .then((response) => response.json())
            .then(
                (
                    response: { items: { name: string; id: number }[] } | { error: { error: string; message: string } },
                ) => {
                    if ('error' in response) {
                        alert(response.error.message);
                        console.error(response.error);
                        // dispatch(
                        //     alertSlice.actions.add({
                        //         message: `Error: ${response.error.message}`,
                        //         severity: 'warning',
                        //     })
                        // );
                        return;
                    }
                    applyTeachers(response!.items);
                },
            )
            .catch((e) => {
                applyTeachers(null);
                if (online) {
                    alert(e.message);
                    console.error(e.message);
                    // dispatch(
                    //     alertSlice.actions.add({
                    //         message: `Error: ${e.message}`,
                    //         severity: 'error',
                    //     })
                    // );
                }
            })
            .finally(() => {
                setFetching(false);
            });
    }, [fetching, setFetching, applyTeachers, online]);

    const onChangeValues = React.useCallback(
        (value: number | number[] | null) => {
            value = !value ? [] : Array.isArray(value) ? value : [value];
            let values: number[] = value;
            const maxCount = 4 - 1;
            values = values.length > maxCount ? [values[0], ...values.slice(-maxCount)] : values;

            if (values.length !== selected.length || values.some((e, i) => selected[i] !== e)) {
                dispatch(scheduleSlice.actions.setSelectedTeachers(values));
                setHash(values.map((e) => e /* .id */).join(','));
                if (values.length > 0) {
                    store2.set(STORE_TEACHER_NAME_KEY, values);
                }
            }
        },
        [dispatch, setHash, selected],
    );

    const fixSelected = React.useCallback(
        (newSelected: number[] = selected) => {
            let value = newSelected;
            if (teachers.length > 1) {
                value = teachers
                    .map((teacher) => newSelected.find((selected) => teacher.id === selected))
                    .filter(Boolean) as number[];
            }
            if (value.length > 1) {
                onChangeValues(value);
            }
        },
        [teachers, selected, onChangeValues],
    );

    const allowMultiple = React.useCallback(
        (state = true) => {
            dispatch(scheduleSlice.actions.setAllowedMultipleTeachers(state));
            if (!state) {
                const [value] = selected;
                onChangeValues(value);
            } else {
                onChangeValues(selected);
            }
        },
        [onChangeValues, selected],
    );

    // Check correct names after teachers loading
    React.useEffect(() => {
        if (teachers.length > 1) {
            fixSelected();
        }
    }, [teachers]);

    // On location hash changed
    React.useEffect(() => {
        if (
            (defaultValues.some((e, i) => selected[i] !== e) || defaultValues.length !== selected.length) &&
            selected.length !== 0
        ) {
            fixSelected(defaultValues);
        }
    }, [defaultValues]);

    React.useEffect(() => {
        if (previousOnline && (online !== previousOnline || (since && Date.now() - since.getTime() > 2 * 60e3))) {
            loadTeachersList();
        }
    }, [online, previousOnline, since]);

    React.useEffect(() => {
        loadTeachersList();
        fixSelected(defaultValues);

        if (window.location.search.includes('allow_multiple')) {
            allowMultiple();
        }
        allowMultipleTeachersRef && (allowMultipleTeachersRef.current = allowMultiple);
    }, []);

    const isMultiple = allowedMultiple || selected.length > 1;

    return (
        <Autocomplete
            multiple={isMultiple}
            // sx={{ minWidth: 200, maxWidth: 400 }}
            id="teachers-native-select"
            options={teachers.map((e) => e.id)}
            disableCloseOnSelect={isMultiple}
            disableListWrap
            getOptionLabel={(option) => teachers.find((e) => option === e.id)?.name || 'NoName'}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={formatMessage({ id: `text.teacher${isMultiple ? 's' : ''}` })}
                    placeholder={((e) => (e.length > 0 && e[Math.floor(Math.random() * e.length)].name) || '...')(
                        teachers,
                    )}
                />
            )}
            PopperComponent={MyPopper}
            value={!isMultiple && Array.isArray(selected) ? selected[0] : selected}
            onChange={(event, newValue, reason) => {
                if (
                    event.type === 'keydown' &&
                    (event as React.KeyboardEvent).key === 'Backspace' &&
                    reason === 'removeOption'
                ) {
                    return;
                }
                onChangeValues(newValue);
            }}
            disabled={fetching}
        />
    );
};
export default TeacherSelect;
