// Plain JSX: Next.js pre-serializes this boundary into every render of
// routes under /super, so it must be a plain React node. A Response
// object here crashes RSC serialization ("Classes ... are not
// supported"). notFound() itself sets the HTTP 404 status.
export default function NotFound() {
  return null;
}
