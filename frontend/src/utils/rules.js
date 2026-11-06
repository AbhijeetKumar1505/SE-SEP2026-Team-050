// Reusable React Hook Form rules, so every input validates the same way.
const tooLong = (max) => ({ value: max, message: `Use at most ${max} characters.` })

// Required text: not empty, not just spaces, not too long.
export const required = (message, max = 200) => ({
  required: message,
  maxLength: tooLong(max),
  validate: (v) => !!v.trim() || message,
})
export const optional = (max = 500) => ({ maxLength: tooLong(max) })

export const EMAIL = { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' }
export const PHONE = { value: /^\+?[\d\s-]{7,15}$/, message: 'Enter a valid phone number.' }
export const LINK = { value: /^https?:\/\/\S+$/i, message: 'Enter a full link starting with https://' }
