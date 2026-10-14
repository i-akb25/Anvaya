import Link from "next/link";

export function Brand() {
  return <Link className="brand-lockup" href="/" aria-label="Anvaya home">
    <img src="/anvaya-mark.svg" alt="" width="48" height="48" />
    <span><span className="brand">anvaya<span className="brand-dot">.</span></span>
      <span className="brand-caption">Connected learning, grounded preparation</span></span>
  </Link>;
}
