'use client'

import { useTranslations } from 'next-intl'
import { Car, Tractor, Truck, Bike, BookmarkPlus, CheckCircle2, X, Wrench } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useRouter, Link } from '@/i18n/routing'
import { useVehicleStore } from '@/lib/store/vehicle.store'
import { useAuthStore } from '@/lib/store/auth.store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { carsApi } from '@/lib/api/cars'
import { toast } from 'sonner'
import clsx from 'clsx'

const VEHICLE_PARAM_KEYS = ['make', 'model', 'engine']

export function VehicleContextBar() {
  return null
}