import * as z from 'zod'

export const checkoutSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().regex(/^[0-9]{8}$/, 'Le numéro de téléphone doit contenir 8 chiffres'),
  address: z.string().min(5, 'L\'adresse est requise'),
  city: z.string().min(2, 'La ville est requise'),
  postalCode: z.string().regex(/^[0-9]{4}$/, 'Le code postal doit contenir 4 chiffres'),
  notes: z.string().optional(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
