// ============================================================
// TAILWIND PRODUCTION SAFELIST
// ============================================================
// Tailwind's JIT scanner only includes classes it finds as
// complete strings in source files. On Netlify (production
// build), any class assembled dynamically or missed by the
// scanner is purged — even if it works fine on localhost.
//
// This file is the fix. It lists every class that must survive
// the production build as full, unbroken strings. The scanner
// finds them here and keeps them in the CSS bundle.
//
// DO NOT use template literals or concatenation in this file.
// Every class must appear as a complete string literal.
//
// This file is never imported or executed — it exists purely
// so the Tailwind scanner can read it.
// ============================================================

const _tailwindSafelist = [

  // ----------------------------------------------------------
  // CONTAINERS & MAX-WIDTHS
  // ----------------------------------------------------------
  'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl',
  'max-w-2xl', 'max-w-3xl', 'max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl',
  'max-w-full', 'max-w-none', 'max-w-screen-sm', 'max-w-screen-md',
  'max-w-screen-lg', 'max-w-screen-xl', 'max-w-screen-2xl',
  'mx-auto', 'w-full', 'w-screen',
  'min-h-screen', 'h-full', 'h-screen',

  // ----------------------------------------------------------
  // HORIZONTAL PADDING (mobile-first responsive)
  // ----------------------------------------------------------
  'px-0', 'px-2', 'px-4', 'px-6', 'px-8', 'px-10', 'px-12', 'px-16',
  'sm:px-0', 'sm:px-2', 'sm:px-4', 'sm:px-6', 'sm:px-8', 'sm:px-10', 'sm:px-12',
  'md:px-4', 'md:px-6', 'md:px-8', 'md:px-10', 'md:px-12',
  'lg:px-4', 'lg:px-6', 'lg:px-8', 'lg:px-10', 'lg:px-12', 'lg:px-16',
  'xl:px-8', 'xl:px-12', 'xl:px-16',

  // ----------------------------------------------------------
  // VERTICAL PADDING (mobile-first responsive)
  // ----------------------------------------------------------
  'py-0', 'py-2', 'py-4', 'py-6', 'py-8', 'py-10', 'py-12',
  'py-16', 'py-20', 'py-24', 'py-28', 'py-32',
  'sm:py-8', 'sm:py-10', 'sm:py-12', 'sm:py-16', 'sm:py-20', 'sm:py-24',
  'md:py-12', 'md:py-16', 'md:py-20', 'md:py-24',
  'lg:py-16', 'lg:py-20', 'lg:py-24', 'lg:py-28', 'lg:py-32',
  'xl:py-24', 'xl:py-32',

  // ----------------------------------------------------------
  // ALL-SIDE PADDING
  // ----------------------------------------------------------
  'p-0', 'p-2', 'p-4', 'p-6', 'p-8', 'p-10', 'p-12', 'p-16',
  'sm:p-4', 'sm:p-6', 'sm:p-8',
  'lg:p-8', 'lg:p-12',

  // ----------------------------------------------------------
  // MARGIN
  // ----------------------------------------------------------
  'mt-0', 'mt-2', 'mt-4', 'mt-6', 'mt-8', 'mt-10', 'mt-12', 'mt-16', 'mt-20',
  'mb-0', 'mb-2', 'mb-4', 'mb-6', 'mb-8', 'mb-10', 'mb-12', 'mb-16', 'mb-20',
  'my-0', 'my-2', 'my-4', 'my-6', 'my-8', 'my-10', 'my-12', 'my-16', 'my-20',
  'sm:mt-8', 'sm:mb-8', 'sm:my-8',
  'lg:mt-12', 'lg:mb-12', 'lg:my-12',

  // ----------------------------------------------------------
  // FLEXBOX
  // ----------------------------------------------------------
  'flex', 'inline-flex', 'flex-col', 'flex-row', 'flex-wrap',
  'items-start', 'items-center', 'items-end', 'items-stretch',
  'justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around',
  'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8', 'gap-10', 'gap-12',
  'sm:flex-row', 'sm:flex-col', 'sm:items-center', 'sm:justify-between',
  'sm:gap-4', 'sm:gap-6', 'sm:gap-8',
  'md:flex-row', 'md:gap-6', 'md:gap-8',
  'lg:flex-row', 'lg:gap-8', 'lg:gap-12',

  // ----------------------------------------------------------
  // GRID
  // ----------------------------------------------------------
  'grid', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4',
  'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3',
  'md:grid-cols-2', 'md:grid-cols-3', 'md:grid-cols-4',
  'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4',
  'xl:grid-cols-3', 'xl:grid-cols-4',
  'col-span-1', 'col-span-2', 'col-span-3', 'col-span-full',
  'sm:col-span-2', 'lg:col-span-2',

  // ----------------------------------------------------------
  // TYPOGRAPHY — SIZES (responsive)
  // ----------------------------------------------------------
  'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl',
  'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl',
  'sm:text-sm', 'sm:text-base', 'sm:text-lg', 'sm:text-xl',
  'sm:text-2xl', 'sm:text-3xl', 'sm:text-4xl', 'sm:text-5xl',
  'md:text-xl', 'md:text-2xl', 'md:text-3xl', 'md:text-4xl',
  'lg:text-lg', 'lg:text-xl', 'lg:text-2xl', 'lg:text-3xl',
  'lg:text-4xl', 'lg:text-5xl', 'lg:text-6xl', 'lg:text-7xl',
  'xl:text-5xl', 'xl:text-6xl', 'xl:text-7xl',
  'font-normal', 'font-medium', 'font-semibold', 'font-bold',
  'text-left', 'text-center', 'text-right',
  'sm:text-left', 'sm:text-center',
  'lg:text-left', 'lg:text-center',
  'leading-snug', 'leading-normal', 'leading-relaxed', 'leading-loose',
  'tracking-tight', 'tracking-normal', 'tracking-wide', 'tracking-wider', 'tracking-widest',

  // ----------------------------------------------------------
  // DISPLAY / VISIBILITY (responsive)
  // ----------------------------------------------------------
  'hidden', 'block', 'inline', 'inline-block',
  'sm:hidden', 'sm:block', 'sm:flex', 'sm:inline-flex',
  'md:hidden', 'md:block', 'md:flex',
  'lg:hidden', 'lg:block', 'lg:flex',
  'xl:hidden', 'xl:block',

  // ----------------------------------------------------------
  // POSITIONING
  // ----------------------------------------------------------
  'relative', 'absolute', 'fixed', 'sticky', 'static',
  'inset-0', 'inset-x-0', 'inset-y-0',
  'top-0', 'right-0', 'bottom-0', 'left-0',
  'z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50',

  // ----------------------------------------------------------
  // SIZING
  // ----------------------------------------------------------
  'w-4', 'w-6', 'w-8', 'w-10', 'w-12', 'w-16', 'w-20', 'w-24',
  'w-32', 'w-40', 'w-48', 'w-56', 'w-64', 'w-72', 'w-80', 'w-96',
  'w-1/2', 'w-1/3', 'w-2/3', 'w-1/4', 'w-3/4',
  'sm:w-full', 'sm:w-1/2', 'md:w-1/2', 'md:w-1/3', 'lg:w-1/3', 'lg:w-1/4',
  'h-4', 'h-6', 'h-8', 'h-10', 'h-12', 'h-16', 'h-20', 'h-24',
  'h-32', 'h-40', 'h-48', 'h-56', 'h-64', 'h-72', 'h-80', 'h-96',
  'sm:h-32', 'sm:h-48', 'sm:h-64',
  'lg:h-48', 'lg:h-64', 'lg:h-96',

  // ----------------------------------------------------------
  // BORDERS & RADIUS
  // ----------------------------------------------------------
  'rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl',
  'rounded-2xl', 'rounded-3xl', 'rounded-full',
  'border', 'border-0', 'border-2', 'border-4',
  'border-t', 'border-b', 'border-l', 'border-r',

  // ----------------------------------------------------------
  // BACKGROUND & OPACITY
  // ----------------------------------------------------------
  'bg-white', 'bg-black', 'bg-transparent',
  'bg-opacity-10', 'bg-opacity-20', 'bg-opacity-30',
  'bg-opacity-40', 'bg-opacity-50', 'bg-opacity-75', 'bg-opacity-90',
  'opacity-0', 'opacity-25', 'opacity-50', 'opacity-75', 'opacity-100',
  'bg-cover', 'bg-center', 'bg-no-repeat',

  // ----------------------------------------------------------
  // OVERFLOW
  // ----------------------------------------------------------
  'overflow-hidden', 'overflow-visible', 'overflow-auto', 'overflow-scroll',
  'overflow-x-hidden', 'overflow-y-auto',

  // ----------------------------------------------------------
  // OBJECT FIT
  // ----------------------------------------------------------
  'object-cover', 'object-contain', 'object-center', 'object-top',

  // ----------------------------------------------------------
  // TRANSITIONS & TRANSFORMS
  // ----------------------------------------------------------
  'transition', 'transition-all', 'transition-colors', 'transition-transform',
  'duration-150', 'duration-200', 'duration-300', 'duration-500',
  'ease-in', 'ease-out', 'ease-in-out',
  'hover:scale-105', 'hover:scale-110',
  'hover:opacity-80', 'hover:opacity-90',

  // ----------------------------------------------------------
  // SHADOW
  // ----------------------------------------------------------
  'shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl',
  'shadow-none',

  // ----------------------------------------------------------
  // SPACE-BETWEEN (for flex children)
  // ----------------------------------------------------------
  'space-y-2', 'space-y-3', 'space-y-4', 'space-y-6', 'space-y-8',
  'space-x-2', 'space-x-3', 'space-x-4', 'space-x-6', 'space-x-8',
  'sm:space-y-0', 'sm:space-x-4', 'sm:space-x-6',

];

export default _tailwindSafelist;
