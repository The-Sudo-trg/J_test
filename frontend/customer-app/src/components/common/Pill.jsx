function Pill({ children, tone = "slate" }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}
export default Pill;
