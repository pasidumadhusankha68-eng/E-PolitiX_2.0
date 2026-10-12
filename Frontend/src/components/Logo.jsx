import mainLogo from '../img/main_logo.svg'

export default function Logo({ size = 'base' }) {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    base: 'h-8 w-auto',
    lg: 'h-10 w-auto',
    xl: 'h-12 w-auto',
    '2xl': 'h-14 w-auto',
    '3xl': 'h-16 w-auto',
    '4xl': 'h-20 w-auto',
  }

  const baseSize = sizeClasses[size] || sizeClasses.base

  return (
    <img
      src={mainLogo}
      alt="E-PolitiX Logo"
      className={baseSize}
    />
  )
}