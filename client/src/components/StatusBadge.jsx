const colors = {
  pending: "bg-warning text-dark",
  approved: "bg-success",
  rejected: "bg-danger",
};

// small coloured label: Pending / Approved / Rejected
export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${colors[status] || "bg-secondary"} text-capitalize`}>
      {status}
    </span>
  );
}
