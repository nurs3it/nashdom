import * as React from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
  country?: 'kz' | 'ru';
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = '', onChange, country = 'kz', ...props }, ref) => {
    // Конфигурация для разных стран
    const config = {
      kz: {
        placeholder: "+7 (___) ___-__-__",
        prefix: "+7",
      },
      ru: {
        placeholder: "+7 (___) ___-__-__",
        prefix: "+7",
      }
    }[country];

    // Функция для форматирования номера телефона
    const formatPhoneNumber = (input: string): string => {
      // Удаляем все символы кроме цифр
      const digits = input.replace(/\D/g, '');
      
      // Если пусто, возвращаем пустую строку
      if (!digits) return '';
      
      // Обрабатываем разные форматы ввода
      let processedDigits = digits;
      
      // Если начинается с 8, заменяем на 7
      if (processedDigits.startsWith('8')) {
        processedDigits = '7' + processedDigits.slice(1);
      }
      
      // Если не начинается с 7, добавляем 7 в начало
      if (!processedDigits.startsWith('7')) {
        processedDigits = '7' + processedDigits;
      }
      
      // Ограничиваем до 11 цифр (7 + 10)
      processedDigits = processedDigits.slice(0, 11);
      
      // Форматируем в красивый вид
      let formatted = '+7';
      
      if (processedDigits.length > 1) {
        formatted += ' (' + processedDigits.slice(1, 4);
        if (processedDigits.length > 4) {
          formatted += ') ' + processedDigits.slice(4, 7);
          if (processedDigits.length > 7) {
            formatted += '-' + processedDigits.slice(7, 9);
            if (processedDigits.length > 9) {
              formatted += '-' + processedDigits.slice(9, 11);
            }
          }
        }
      }
      
      return formatted;
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formatted = formatPhoneNumber(inputValue);
      
      // Устанавливаем отформатированное значение
      e.target.value = formatted;
      
      // Вызываем onChange с отформатированным значением
      onChange?.(formatted);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Разрешаем навигационные клавиши
      if ([
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End'
      ].includes(e.key)) {
        return;
      }
      
      // Разрешаем Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey || e.metaKey) {
        return;
      }
      
      // Разрешаем только цифры
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      const formatted = formatPhoneNumber(pastedText);
      
      if (e.currentTarget) {
        e.currentTarget.value = formatted;
        onChange?.(formatted);
      }
    };

    return (
      <Input
        ref={ref}
        type="tel"
        value={formatPhoneNumber(value)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={cn("font-mono tracking-wider", className)}
        placeholder={config.placeholder}
        {...props}
      />
    )
  }
)

PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
