import { api } from '@/server/client';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';

type InferPromise<T> = T extends Promise<infer U> ? U : T;

export function useAPI<Fetcher extends (req: typeof api) => any>(
	requestCall: Fetcher,
	config?: SWRConfiguration<InferPromise<ReturnType<Fetcher>>>
): SWRResponse<InferPromise<ReturnType<Fetcher>>["data"], any> {

	const fetcher = async () => {
		const response = await requestCall(api);
		return response.data;
	};

	const data = useSWR("/", fetcher, config);

	return data;
}