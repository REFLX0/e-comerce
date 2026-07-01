"use client";

import { useState } from 'react'
import type { Product } from '@/lib/types'
import { StickyMobileCart } from './StickyMobileCart'

interface Props {
  product: Product
}

export function StickyMobileCartWrapper({ product }: Props) {
  const defaultVariant = product.variants?.[0]
  
  if (!defaultVariant) return null

  return <StickyMobileCart product={product} variant={defaultVariant} />
}
