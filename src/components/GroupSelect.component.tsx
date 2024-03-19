import React from 'react';
import { useHash, useNetworkState } from 'react-use';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import store2 from 'store2';

import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Popper, { PopperProps } from '@mui/material/Popper';
import { styled } from '@mui/material/styles';

import scheduleSlice, { getLastGroups, STORE_GROUP_NAME_KEY } from '../store/reducer/schedule/schedule.slice';
import * as envUtils from '../utils/env.utils';
import { RootState } from '../store';

const STORE_CACHED_INSTITUTES_KEY = 'CACHED_INSTITUTES';

const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        '& ul': { margin: 0 },
        '& li': { margin: 0 },
    },
});

const MyPopper = (props: PopperProps) => <StyledPopper {...props} style={{ width: 350 }} />;

const GroupSelect = (props: { allowMultipleGroupsRef?: React.MutableRefObject<(state?: any) => void> }) => {
    const { allowMultipleGroupsRef } = props;
    const dispatch = useDispatch();
    const { selectedGroups: selected, allowedMultipleGroups: allowedMultiple } = useSelector<
        RootState,
        RootState['schedule']
    >((state) => state.schedule);

    const { formatMessage } = useIntl();
    const { online, previous: previousOnline, since } = useNetworkState();
    const [hash, setHash] = useHash();
    const defaultValues = React.useMemo(() => {
        const groupNames = getLastGroups();
        const defaultHash = decodeURI(hash.slice(1));
        let values = defaultHash.split(',');
        values = values.length > 0 ? values.filter((e) => isNaN(Number(e))) : groupNames;
        // store2.set(STORE_GROUP_NAME_KEY, values[0]);
        return values;
    }, [hash]);

    const [institutes, setInstitutes] = React.useState<{ name: string; groups: string[] }[]>([]);
    const [fetching, setFetching] = React.useState(false);
    const [isCached, setIsCached] = React.useState(false);

    const applyInstitutes = React.useCallback(
        (items: { name: string; groups: string[] }[] | null) => {
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

        fetch(`${envUtils.apiPath}/ystu/schedule/institutes?extramural=true`)
            .then((response) => response.json())
            .then(
                (
                    response:
                        | { items: { name: string; groups: string[] }[] }
                        | { error: { error: string; message: string } },
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
                    applyInstitutes(response!.items);
                },
            )
            .catch((e) => {
                applyInstitutes(null);
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
    }, [fetching, setFetching, applyInstitutes, online]);

    const onChangeValues = React.useCallback(
        (value: string | string[] | null) => {
            value = !value ? [] : typeof value !== 'string' ? value : value.split(',');
            value = value.filter(Boolean);
            let values: string[] = value;
            const maxGroups = 10 - 1;
            values = values.length > maxGroups ? [values[0], ...values.slice(-maxGroups)] : values;

            if (values.some((e, i) => selected[i] !== e) || values.length !== selected.length) {
                dispatch(scheduleSlice.actions.setSelectedGroups(values));
                setHash(values.join(','));
                if (values.length > 0) {
                    store2.set(STORE_GROUP_NAME_KEY, values);
                }
            }
        },
        [dispatch, setHash, selected],
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
            if (value.length > 1) {
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
        if (previousOnline && (online !== previousOnline || (since && Date.now() - since.getTime() > 2 * 60e3))) {
            loadGroupsList();
        }
    }, [online, previousOnline, since]);

    React.useEffect(() => {
        loadGroupsList();
        fixSelected(defaultValues);

        if (window.location.search.includes('allow_multiple')) {
            allowMultiple();
        }
        allowMultipleGroupsRef && (allowMultipleGroupsRef.current = allowMultiple);
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
export default GroupSelect;
