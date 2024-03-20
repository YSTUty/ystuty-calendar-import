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
import scheduleSlice, { getLastGroups, STORE_GROUP_NAME_KEY } from '../store/reducer/schedule/schedule.slice';

/**
 * Название института и массив групп
 */
export interface IInstituteGroupsData {
    /**
     * Название института
     * @example Институт цифровых систем
     */
    name: string;

    /**
     * Название групп (`string`) или детальная информация (`object`) о группах при `additional=true`
     */
    groups: /* GroupDetailDto | */ string[];
}

// const STORE_CACHED_INSTITUTES_KEY_OLD = 'CACHED_INSTITUTES';
const STORE_CACHED_INSTITUTES_KEY = 'CACHED_V3_INSTITUTES::';

const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        '& ul': { margin: 0 },
        '& li': { margin: 0 },
    },
});

const MyPopper = (props: PopperProps) => <StyledPopper {...props} style={{ width: 350 }} />;

export const SelectGroupComponent = (props: { allowMultipleRef?: React.MutableRefObject<(state?: any) => void> }) => {
    const { allowMultipleRef } = props;
    const dispatch = useDispatch();
    const allowedMultiple = useSelector((state) => state.schedule.allowedMultipleGroups);
    const selected = useSelector((state) => state.schedule.selectedGroups);

    const { formatMessage } = useIntl();
    const { online, previous: previousOnline, since } = useNetworkState();
    const [hash, setHash] = useHash();
    const defaultValues = React.useMemo(() => {
        const groupNames = getLastGroups();
        const defaultHash = decodeURI(hash.slice(1));
        let values = defaultHash.split(',').filter((e) => e.length > 0 && e.includes('-'));
        values = values.length > 0 ? values : groupNames;
        return values;
    }, [hash]);
    const [institutes, setInstitutes] = React.useState<{ name: string; groups: string[] }[]>([]);
    const [fetching, setFetching] = React.useState(false);
    const [isCached, setIsCached] = React.useState(false);

    const applyInstitutes = React.useCallback(
        (items: IInstituteGroupsData[] | null) => {
            if (!items) {
                items = store2.get(STORE_CACHED_INSTITUTES_KEY, null);
                if (!items) {
                    return;
                }
                setIsCached(true);
            } else if (items.length > 0) {
                store2.set(STORE_CACHED_INSTITUTES_KEY, items);
                setIsCached(false);
            }

            // items.sort();
            setInstitutes(items);
        },
        [setInstitutes, setIsCached],
    );

    const loadGroupsList = React.useCallback(() => {
        if (fetching) {
            return;
        }

        setFetching(true);

        const abortController = new AbortController();
        const signal = abortController.signal;
        fetch(`${envUtils.apiPath}/v1/schedule/actual_groups`, { signal })
            .then(
                async (response) =>
                    [
                        response,
                        (await response.json()) as
                            | {
                                  name: string;
                                  items: IInstituteGroupsData[];
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
                                formatMessage({ id: 'text.error.on.load-groups' }) +
                                '\n' +
                                formatMessage({ id: 'text.error.message' }, { message: response.error.message }),
                        );
                        return;
                    }

                    alert(
                        formatMessage({ id: 'text.error.title' }) +
                            ' ' +
                            formatMessage({ id: 'text.error.on.load-groups' }) +
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
                applyInstitutes(response!.items);
            })
            .catch((err) => {
                if (err.name === 'AbortError') {
                    return;
                }
                applyInstitutes(null);
                if (online) {
                    alert(
                        formatMessage({ id: 'text.error.title' }) +
                            ' ' +
                            formatMessage({ id: 'text.error.on.load-groups' }) +
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
    }, [fetching, setFetching, applyInstitutes, online]);

    const onChangeValues = React.useCallback(
        (value: string | string[] | null) => {
            value = !value ? [] : typeof value !== 'string' ? value : value.split(',');
            value = value.filter(Boolean);
            let values: string[] = value;
            const maxGroups = 10 - 1;
            values = values.length > maxGroups ? [values[0], ...values.slice(-maxGroups)] : values;
            values = values.filter((w, i) => values.indexOf(w) === i);

            if (values.length !== selected.length || values.some((e, i) => selected[i] !== e)) {
                dispatch(scheduleSlice.actions.setSelectedGroups(values));

                const lowerGroups = institutes.flatMap((e) => e.groups.map((e) => e.toLowerCase()));
                const defaultHash = decodeURI(hash.slice(1));
                // Сохраняем другие значения, не названия групп
                let otherHashValues = defaultHash
                    .split(',')
                    .filter(
                        (e) =>
                            e.length > 0 &&
                            !lowerGroups.some((v) => v.toLowerCase() === e.toLowerCase()) /* && !e.includes('-') */,
                    );

                setHash([...values, ...otherHashValues.filter((w, i) => otherHashValues.indexOf(w) === i)].join(','));
                if (values.length > 0) {
                    store2.set(STORE_GROUP_NAME_KEY, values);
                }
            }
        },
        [dispatch, hash, setHash, selected],
    );

    const fixSelected = React.useCallback(
        (newSelected: string[] = selected) => {
            let value = newSelected;
            const groups = institutes.flatMap((e) => e.groups.map((e) => e));
            if (groups.length > 1) {
                const lowerGroups = groups.map((e) => e.toLowerCase());
                const lowerSelected = newSelected.map((e) => e.toLowerCase());
                value = lowerSelected
                    .map((e) => lowerGroups.findIndex((g) => g === e))
                    .filter((e) => e > -1)
                    .map((e) => groups[e]);
                value = value.filter((w, i) => value.indexOf(w) === i);
            }
            if (value.length > 1 /* 0 */) {
                onChangeValues(value);
            }
        },
        [institutes, selected, onChangeValues],
    );

    const allowMultiple = React.useCallback(
        (state = true) => {
            dispatch(scheduleSlice.actions.setAllowedMultipleGroup(state));
            if (!state) {
                const [value] = selected;
                onChangeValues(value);
            } else {
                onChangeValues(selected);
            }
        },
        [onChangeValues, selected],
    );

    // Check correct names after institutes loading
    React.useEffect(() => {
        if (institutes.length > 1) {
            fixSelected();
        }
    }, [institutes]);

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
            const abortController = loadGroupsList();
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

    const options = React.useMemo(
        () =>
            institutes.reduce(
                (prev, cur) => ({ ...prev, ...Object.fromEntries(cur.groups.map((g) => [g, cur.name])) }),
                {} as Record<string, string>,
            ),
        [institutes],
    );

    const value = isMultiple ? (institutes.length > 0 ? selected : []) : institutes.length > 0 ? selected[0] : '';

    return (
        <Autocomplete
            multiple={isMultiple}
            // sx={{ minWidth: 200, maxWidth: 400 }}
            id="grouped-native-select"
            options={Object.keys(options)}
            disableCloseOnSelect
            disableListWrap
            getOptionLabel={(option) => option}
            groupBy={(option) => options[option]}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={formatMessage({ id: `text.group${isMultiple ? 's' : ''}` })}
                    placeholder={((e) => (e.length > 0 && e[Math.floor(Math.random() * e.length)]) || '...')(
                        Object.keys(options),
                    )}
                />
            )}
            PopperComponent={MyPopper}
            value={value}
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
