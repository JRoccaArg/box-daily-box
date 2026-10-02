import { GoogleMark } from "./GoogleMark";

export function GoogleAccountStatus({email}: {email?: string | null}) {
 return <div className="google-account-status">
  <span className="google-account-mark"><GoogleMark/></span>
  <div className="google-account-copy"><strong>Google conectado</strong>{email && <span title={email}>{email}</span>}</div>
  <span className="google-account-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4 4 10-10"/></svg></span>
 </div>;
}
