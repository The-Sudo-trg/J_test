import { useMemo, useState } from "react";

const initialJobs = [
  { id: "NB-10428", store: "Fresh Basket", customer: "Ananya Rao", address: "80 Feet Road, Koramangala", items: 4, amount: 382, status: "Ready for pickup", eta: "22 min" },
  { id: "NB-10421", store: "Daily Dairy", customer: "Dev Shah", address: "5th Block, Koramangala", items: 3, amount: 244, status: "Ready for pickup", eta: "18 min" },
  { id: "NB-10412", store: "Corner Pantry", customer: "Nisha Gupta", address: "ST Bed Layout", items: 5, amount: 468, status: "On delivery", eta: "9 min" },
];

export default function App() {
  const [online, setOnline] = useState(true);
  const [jobs, setJobs] = useState(initialJobs);
  const activeJob = jobs.find((job) => job.status === "On delivery");
  const availableJobs = jobs.filter((job) => job.status === "Ready for pickup");
  const completed = useMemo(() => jobs.filter((job) => job.status === "Delivered").length, [jobs]);

  const VALID_JOB_TRANSITIONS = {
    "Ready for pickup": "On delivery",
    "On delivery": "Delivered",
  };

  const updateJob = (id, targetStatus) => {
    setJobs((current) =>
      current.map((job) => {
        if (job.id !== id) return job;
        // Validate valid lifecycle transition
        if (VALID_JOB_TRANSITIONS[job.status] !== targetStatus) {
          return job;
        }
        return { ...job, status: targetStatus };
      })
    );
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span>J</span> justto <small>delivery partner</small></div>
        <button className={`status-toggle ${online ? "online" : "offline"}`} onClick={() => setOnline((value) => !value)}>
          <i /> {online ? "Online" : "Offline"}
        </button>
      </header>

      <section className="welcome">
        <div><p>GOOD AFTERNOON, RAVI</p><h1>Ready to make a few deliveries?</h1><span>{online ? "You are visible for new pickup requests." : "Go online to receive pickup requests."}</span></div>
        <div className="earnings"><small>TODAY'S EARNINGS</small><b>₹{completed * 42 + 286}</b><span>{completed + 7} deliveries completed</span></div>
      </section>

      <section className="metrics">
        <article><small>Available pickups</small><b>{availableJobs.length}</b><span>within 2 km</span></article>
        <article><small>Active delivery</small><b>{activeJob ? "1" : "0"}</b><span>{activeJob ? `ETA ${activeJob.eta}` : "No drop in progress"}</span></article>
        <article><small>Acceptance rate</small><b>96%</b><span>Excellent standing</span></article>
      </section>

      {activeJob && <section className="active-card"><div><p>ACTIVE DELIVERY</p><h2>{activeJob.customer} <span>· {activeJob.id}</span></h2><p>{activeJob.store} → {activeJob.address}</p></div><div className="active-actions"><b>ETA {activeJob.eta}</b><button onClick={() => updateJob(activeJob.id, "Delivered")}>Mark delivered</button></div></section>}

      <section className="jobs"><div className="section-title"><div><p>NEW PICKUPS</p><h2>Orders ready for collection</h2></div><span>{availableJobs.length} nearby</span></div>
        {!online && <div className="notice">You are offline. Go online to accept a pickup.</div>}
        <div className="job-grid">{availableJobs.map((job) => <article className="job-card" key={job.id}><div className="job-head"><span className="store-icon">🏪</span><div><b>{job.store}</b><small>{job.id} · {job.items} items</small></div><em>₹{job.amount}</em></div><p>Pickup then deliver to <strong>{job.customer}</strong></p><div className="job-footer"><span>📍 {job.address}</span><button disabled={!online} onClick={() => updateJob(job.id, "On delivery")}>Accept pickup</button></div></article>)}</div>
      </section>
    </main>
  );
}
