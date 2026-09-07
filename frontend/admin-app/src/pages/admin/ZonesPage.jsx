
import {
	PageIntro,
	SectionHeader
} from "@/components";
import { useMarketplace } from "@/context/MarketplaceContext";

function ZonesPage() {
	const { radius, setRadius, notify } = useMarketplace();

	const households = {
		2: '7,200',
		3: '12,400',
		4: '18,000',
		5: '24,500',
		6: '30,100',
		7: '36,800',
		8: '43,000',
	}[radius];

	return (
		<>
			<PageIntro
				eyebrow="MARKETPLACE OPERATIONS"
				title="Delivery zones"
				description="Balance customer reach with the speed and reliability of every local drop."
				actions={
					<button
						className="primary-button inline"
						onClick={() => notify('Zone changes saved')}
					>
						Save coverage
					</button>
				}
			/>

			<div className="zone-layout">
				<section className="panel zone-control">
					<SectionHeader
						title="Koramangala core"
						description="Primary service zone"
					/>

					<div className="large-zone-map">
						<span className="zone-node store-a">Fresh Basket</span>
						<span className="zone-node store-b">Daily Dairy</span>
						<span className="zone-node store-c">Corner Pantry</span>
						<div className="radius-ring r1" />
						<div className="radius-ring r2" />
						<div className="home-cluster">
							⌂ ⌂ ⌂
							<br />
							⌂ ⌂ ⌂
						</div>
					</div>
				</section>

				<aside className="panel radius-card">
					<p className="eyebrow">
						<i /> CUSTOMER COVERAGE
					</p>

					<h2>Maximum delivery radius</h2>

					<div className="radius-number">
						<b>{radius}</b>
						<span>km</span>
					</div>

					<input
						type="range"
						min="2"
						max="8"
						value={radius}
						onChange={(event) => setRadius(Number(event.target.value))}
					/>

					<div className="radius-ticks">
						<span>2 km</span>
						<span>8 km</span>
					</div>

					<div className="impact-list">
						<div>
							<span>⌂</span>
							<p>
								<b>{households}</b>
								<small>households covered</small>
							</p>
						</div>

						<div>
							<span>⚡</span>
							<p>
								<b>{14 + radius * 2} min</b>
								<small>expected average delivery</small>
							</p>
						</div>

						<div>
							<span>♜</span>
							<p>
								<b>{radius < 3 ? '3' : radius < 5 ? '6' : '7'} stores</b>
								<small>in service range</small>
							</p>
						</div>
					</div>

					<div className={`radius-alert ${radius > 5 ? 'warning' : ''}`}>
						{radius > 5
							? '⚠ Above 5 km may compromise the delivery promise during peak demand.'
							: '✓ This radius supports a reliable sub-30-minute delivery promise.'}
					</div>
				</aside>
			</div>
		</>
	);
}

export default ZonesPage;