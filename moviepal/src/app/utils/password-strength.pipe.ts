import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'passwordStrength'
})
export class PasswordStrengthPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return 'Weak';
    if (value.length >= 8 && /\d/.test(value) && /[A-Z]/.test(value)) {
      return 'Strong';
    }
    if (value.length >= 6) {
      return 'Medium';
    }
    return 'Weak';
  }
}