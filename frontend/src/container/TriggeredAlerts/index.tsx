import getTriggeredApi from 'api/alerts/getTriggered';
import logEvent from 'api/common/logEvent';
import Spinner from 'components/Spinner';
import { REACT_QUERY_KEY } from 'constants/reactQueryKeys';
import useAxiosError from 'hooks/useAxiosError';
import { isUndefined } from 'lodash-es';
import { useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { AppState } from 'store/reducers';

import TriggerComponent from './TriggeredAlert';

function TriggeredAlerts(): JSX.Element {
	const userId = useSelector<AppState, string | undefined>(
		(state) => state.app.user?.userId,
	);

	const hasLoggedEvent = useRef(false); // Track if logEvent has been called

	const handleError = useAxiosError();

	const alertsResponse = useQuery(
		[REACT_QUERY_KEY.GET_TRIGGERED_ALERTS, userId],
		{
			queryFn: () =>
				getTriggeredApi({
					active: true,
					inhibited: true,
					silenced: false,
				}),
			refetchInterval: 30000,
			onError: handleError,
		},
	);

	useEffect(() => {
		if (!hasLoggedEvent.current && !isUndefined(alertsResponse.data?.payload)) {
			logEvent('Alert: Triggered alert list page visited', {
				number: alertsResponse.data?.payload?.length,
			});
			hasLoggedEvent.current = true;
		}
	}, [alertsResponse.data?.payload]);

	if (alertsResponse.error) {
		return <TriggerComponent allAlerts={[]} />;
	}

	if (alertsResponse.isFetching || alertsResponse?.data?.payload === undefined) {
		return <Spinner height="75vh" tip="Loading Alerts..." />;
	}

	return <TriggerComponent allAlerts={alertsResponse?.data?.payload || []} />;
}

export default TriggeredAlerts;
