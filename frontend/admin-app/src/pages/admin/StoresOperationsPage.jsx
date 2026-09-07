import { stores } from "@/data";

import {
	PageIntro,
	Pill,
	StoreName
} from "@/components";
import { useMarketplace } from "@/context/MarketplaceContext";

function StoresOperationsPage() {
	const { notify } = useMarketplace();

	return (
		<>
			<PageIntro
				eyebrow="MARKETPLACE OPERATIONS"
				title="Store network"
				description="Verify operational readiness and protect a fast delivery promise."
				actions={
					<button
						className="primary-button inline"
						onClick={() => notify('Store onboarding flow opened')}
					>
						＋ Add a store
					</button>
				}
			/>

			<div className="panel data-panel">
				<table>
					<thead>
						<tr>
							<th>Store</th>
							<th>Service status</th>
							<th>Orders today</th>
							<th>Packing time</th>
							<th>Delivery promise</th>
							<th />
						</tr>
					</thead>

					<tbody>
						{stores.map((store) => (
							<tr key={store.id}>
								<td>
									<StoreName id={store.id} />
								</td>
								<td>
									<Pill tone={store.status === 'Open' ? 'green' : 'amber'}>
										{store.status === 'Open' ? '● Online' : '● Paused'}
									</Pill>
								</td>
								<td>{store.orders}</td>
								<td>{store.packing}</td>
								<td>
									{store.status === 'Open' ? (
										<Pill tone="green">Healthy</Pill>
									) : (
										<Pill tone="amber">Check merchant</Pill>
									)}
								</td>
								<td>
									<button
										className="table-action"
										onClick={() => notify(`${store.name} profile opened`)}
									>
										Manage
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}

export default StoresOperationsPage;