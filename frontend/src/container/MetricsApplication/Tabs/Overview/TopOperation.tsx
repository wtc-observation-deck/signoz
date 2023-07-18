import getTopOperations from 'api/metrics/getTopOperations';
import Spinner from 'components/Spinner';
import { Card } from 'container/MetricsApplication/styles';
import TopOperationsTable from 'container/MetricsApplication/TopOperationsTable';
import useResourceAttribute from 'hooks/useResourceAttribute';
import { convertRawQueriesToTraceSelectedTags } from 'hooks/useResourceAttribute/utils';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { AppState } from 'store/reducers';
import { PayloadProps } from 'types/api/metrics/getTopOperations';
import { GlobalReducer } from 'types/reducer/globalTime';
import { Tags } from 'types/reducer/trace';

function TopOperation(): JSX.Element {
	const { maxTime, minTime } = useSelector<AppState, GlobalReducer>(
		(state) => state.globalTime,
	);
	const { servicename } = useParams<{ servicename?: string }>();
	const { queries } = useResourceAttribute();
	const selectedTags = useMemo(
		() => (convertRawQueriesToTraceSelectedTags(queries) as Tags[]) || [],
		[queries],
	);

	const { data, isLoading } = useQuery<PayloadProps>({
		queryKey: [minTime, maxTime, servicename, selectedTags],
		queryFn: (): Promise<PayloadProps> =>
			getTopOperations({
				service: servicename || '',
				start: minTime,
				end: maxTime,
				selectedTags,
			}),
	});

	return (
		<Card>
			{isLoading && <Spinner size="large" tip="Loading..." height="40vh" />}
			{!isLoading && <TopOperationsTable data={data || []} />}
		</Card>
	);
}

export default TopOperation;