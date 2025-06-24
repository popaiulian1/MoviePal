export function passwordStrengthValidator(control: import('@angular/forms').AbstractControl) {
  const value = control.value;
  if (!value) return null;
  // Example: at least 6 characters, at least one number
  const valid = value.length >= 6 && /\d/.test(value);
  return valid ? null : { passwordStrength: true };
}

export function passwordsMatchValidator(group: import('@angular/forms').FormGroup) {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}