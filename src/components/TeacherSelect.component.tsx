import React from 'react';
import { useHash, useNetworkState } from 'react-use';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import store2 from 'store2';

import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Popper, { PopperProps } from '@mui/material/Popper';
import { styled } from '@mui/material/styles';

import * as envUtils from '../utils/env.utils';
import { useSelector } from '../store';
import scheduleSlice, { getLastTeachers, STORE_TEACHER_NAME_KEY } from '../store/reducer/schedule/schedule.slice';

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

const TeacherSelect = (props: { allowMultipleRef?: React.MutableRefObject<(state?: any) => void> }) => {
    const { allowMultipleRef } = props;
    const dispatch = useDispatch();

    const allowedMultiple = useSelector((state) => state.schedule.allowedMultipleTeachers);
    const selected = useSelector((state) => state.schedule.selectedTeachers);

    const { online, previous: previousOnline, since } = useNetworkState();

    const { formatMessage } = useIntl();

    const [teachers, setTeachers] = React.useState<ITeacherData[]>([]);
    const [fetching, setFetching] = React.useState(false);
    const [isCached, setIsCached] = React.useState(false);

    const [hash, setHash] = useHash();
    const defaultValues: number[] = React.useMemo(() => {
        const teacherIds = getLastTeachers();
        const defaultHash = decodeURI(hash.slice(1));
        let values = defaultHash
            .split(',')
            .map(Number)
            .filter((e) => e > 0);
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

        const abortController = new AbortController();
        const signal = abortController.signal;
        fetch(`${envUtils.apiPath}/v1/schedule/actual_teachers`, { signal })
            .then(
                async (response) =>
                    [
                        response,
                        (await response.json()) as
                            | {
                                  items: ITeacherData[];
                                  isCache: boolean;
                              }
                            | { error: { error: string; message: string } },
                    ] as const,
            )
            .then(([res, response]) => {
                if ('error' in response) {
                    const retryAfter = res.headers.get('retry-after');
                    if (Number(retryAfter) > 0) {
                        alert(
                            formatMessage({ id: 'text.error.title' }) +
                                ' ' +
                                formatMessage({ id: 'text.error.on.load-teachers' }) +
                                '\n' +
                                formatMessage({ id: 'text.error.message' }, { message: response.error.message }),
                        );
                        return;
                    }

                    alert(
                        formatMessage({ id: 'text.error.title' }) +
                            ' ' +
                            formatMessage({ id: 'text.error.on.load-teachers' }) +
                            '\n' +
                            formatMessage({ id: 'text.error.message' }, { message: response.error.message }),
                    );
                    console.error(response.error);
                    // dispatch(
                    //     alertSlice.actions.add({
                    //         message: `Error: ${response.error.message}`,
                    //         severity: 'warning',
                    //     }),
                    // );
                    return;
                }
                applyTeachers(response!.items);
            })
            .catch((err) => {
                if (err.name === 'AbortError') {
                    return;
                }
                applyTeachers(null);
                if (online) {
                    alert(
                        formatMessage({ id: 'text.error.title' }) +
                            ' ' +
                            formatMessage({ id: 'text.error.on.load-teachers' }) +
                            '\n' +
                            formatMessage({ id: 'text.error.message' }, { message: err.message }),
                    );
                    console.error(err.message);
                    // dispatch(
                    //     alertSlice.actions.add({
                    //         message: `Error: ${err.message}`,
                    //         severity: 'error',
                    //     }),
                    // );
                }
            })
            .finally(() => {
                setFetching(false);
            });

        return abortController;
    }, [fetching, setFetching, applyTeachers, online]);

    const onChangeValues = React.useCallback(
        (value: number | number[] | null) => {
            value = !value ? [] : Array.isArray(value) ? value : [value];
            let values: number[] = value;
            const maxCount = 4 - 1;
            values = values.length > maxCount ? [values[0], ...values.slice(-maxCount)] : values;
            values = values.filter((w, i) => values.indexOf(w) === i);

            if (values.length !== selected.length || values.some((e, i) => selected[i] !== e)) {
                dispatch(scheduleSlice.actions.setSelectedTeachers(values));

                const defaultHash = decodeURI(hash.slice(1));
                // Сохраняем другие значения, не названия групп
                let otherHashValues = defaultHash.split(',').filter((e) => isNaN(+e) && e.length > 0);
                setHash([...otherHashValues.filter((w, i) => otherHashValues.indexOf(w) === i), ...values].join(','));
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
        if (online !== previousOnline || (since && Date.now() - since.getTime() > 2 * 60e3)) {
            const abortController = loadTeachersList();
            return () => {
                abortController && abortController.abort();
            };
        }
    }, [online, previousOnline, since]);

    React.useEffect(() => {
        if (allowMultipleRef) allowMultipleRef.current = allowMultiple;
    }, [allowMultiple]);

    React.useEffect(() => {
        fixSelected(defaultValues);

        if (window.location.search.includes('allow_multiple')) {
            allowMultiple();
        }
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
