"use client";

import Error from 'next/error'

// This page renders when a route like `/unknown` is requested
// that doesn't match a locale.
export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <Error statusCode={404} />
      </body>
    </html>
  )
}
