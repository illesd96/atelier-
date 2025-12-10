# Checkout Form Translation Fix

## Issue
Error messages on the checkout page (https://www.atelier-archilles.hu/checkout) were displaying in English even when the site was set to Hungarian language.

## Root Cause
The Zod validation schema in `CheckoutForm.tsx` had hardcoded English error messages instead of using the i18n translation system.

### Before:
```typescript
const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  // ... more hardcoded English messages
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms'),
  privacyAccepted: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
});
```

## Solution

### 1. Created Dynamic Schema Function
Created a helper function that generates the validation schema with translated error messages:

```typescript
const createCheckoutSchema = (t: any) => {
  const schema = z.object({
    name: z.string().min(2, t('validation.minLength', { min: 2 })),
    email: z.string().email(t('checkout.errors.emailInvalid')),
    street: z.string().min(1, t('checkout.errors.addressRequired')),
    city: z.string().min(1, t('validation.required')),
    postalCode: z.string().min(1, t('validation.required')),
    country: z.string().min(1, t('validation.required')),
    termsAccepted: z.boolean().refine(val => val === true, {
      message: t('checkout.errors.termsRequired')
    }),
    privacyAccepted: z.boolean().refine(val => val === true, {
      message: t('checkout.errors.privacyRequired')
    }),
    // ... etc
  });
  
  return schema;
};
```

### 2. Updated Form Initialization
Modified the form component to use the dynamic schema with current translations:

```typescript
export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess, onError }) => {
  const { t, i18n } = useTranslation();
  
  // Create the schema with current translations
  const checkoutSchema = React.useMemo(() => createCheckoutSchema(t), [t]);

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    // ...
  });
  
  // ...
};
```

## Translation Keys Used

### Hungarian (`hu.json`)
```json
{
  "validation": {
    "required": "Ez a mező kötelező",
    "email": "Kérjük adjon meg egy érvényes email címet",
    "minLength": "Legalább {{min}} karakter szükséges"
  },
  "checkout": {
    "errors": {
      "emailInvalid": "Kérjük adjon meg egy érvényes email címet",
      "addressRequired": "A számlázási cím megadása kötelező",
      "companyRequired": "A cégnév megadása kötelező számlához",
      "taxNumberRequired": "Az adószám megadása kötelező számlához",
      "termsRequired": "El kell fogadnia az általános szerződési feltételeket",
      "privacyRequired": "El kell fogadnia az adatvédelmi tájékoztatót"
    }
  }
}
```

### English (`en.json`)
```json
{
  "validation": {
    "required": "This field is required",
    "email": "Please enter a valid email address",
    "minLength": "Must be at least {{min}} characters"
  },
  "checkout": {
    "errors": {
      "emailInvalid": "Please enter a valid email address",
      "addressRequired": "Billing address is required for invoices",
      "companyRequired": "Company name is required for invoices",
      "taxNumberRequired": "Tax number is required for invoices",
      "termsRequired": "You must accept the terms and conditions",
      "privacyRequired": "You must accept the privacy policy"
    }
  }
}
```

## Error Messages Now Properly Translated

### Field Validation Errors
- ✅ Name field (minimum 2 characters)
- ✅ Email field (valid email format)
- ✅ Street address field (required)
- ✅ City field (required)
- ✅ Postal code field (required)
- ✅ Country field (required)

### Business Invoice Validation
- ✅ Company name (required when business invoice is checked)
- ✅ Tax number (required when business invoice is checked)

### Terms & Privacy
- ✅ Terms and conditions checkbox (must be checked)
- ✅ Privacy policy checkbox (must be checked)

## Benefits

1. **Consistent Language Experience**: All error messages now appear in the user's selected language
2. **Better User Experience**: Hungarian users see Hungarian error messages
3. **Maintainable**: Error messages are centralized in translation files
4. **Dynamic**: Schema updates automatically when language changes
5. **Type-Safe**: TypeScript types are preserved throughout

## Testing

### Hungarian Language (hu)
When form validation fails, error messages appear in Hungarian:
- "Legalább 2 karakter szükséges" (minimum 2 characters required)
- "Kérjük adjon meg egy érvényes email címet" (please enter a valid email)
- "Ez a mező kötelező" (this field is required)
- "El kell fogadnia az általános szerződési feltételeket" (must accept terms)
- "El kell fogadnia az adatvédelmi tájékoztatót" (must accept privacy policy)

### English Language (en)
When form validation fails, error messages appear in English:
- "Must be at least 2 characters"
- "Please enter a valid email address"
- "This field is required"
- "You must accept the terms and conditions"
- "You must accept the privacy policy"

## Files Modified
- `frontend/src/components/CheckoutForm.tsx` - Updated validation schema to use translations

## Related Fix
This fix was implemented alongside the mobile checkbox touch target improvements to provide a complete checkout page experience enhancement.

---

**Last Updated:** December 10, 2025  
**Status:** ✅ Fixed and Deployed

