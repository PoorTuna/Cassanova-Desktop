import type { ImgHTMLAttributes } from 'react'
import logoUrl from '@/assets/logo.png'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>

export function Logo(props: Props) {
  return <img src={logoUrl} alt="Cassanova" draggable={false} {...props} />
}
