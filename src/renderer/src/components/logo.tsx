import type { SVGProps } from 'react'

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Cassanova teardrop mark */}
      <path
        d="M16 2C10.477 2 6 6.477 6 12c0 5.523 4.477 14 10 18 5.523-4 10-12.477 10-18 0-5.523-4.477-10-10-10z"
        fill="var(--cass-brand-primary, #1287b1)"
      />
      <path
        d="M16 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
        fill="var(--cass-bg-app, #08080a)"
      />
    </svg>
  )
}
