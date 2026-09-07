import { statusMeta } from "@/data";

import { Pill } from "@/components";

function Status({ status }) {
  const meta = statusMeta[status];
  return <Pill tone={meta?.tone ?? "slate"}>{meta?.label ?? status}</Pill>;
}
export default Status;
