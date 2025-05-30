import * as React from "react"
import { cn, toUpperCase } from "@/lib/utils"

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  upperCase?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, upperCase = true, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Se não for um campo de senha, email ou número e upperCase for true, converte para maiúsculas
      if (upperCase && type !== 'password' && type !== 'email' && type !== 'number' && e.target.value) {
        const upperValue = toUpperCase(e.target.value);
        // Atualiza o valor do campo
        e.target.value = upperValue;
      }
      
      // Chama o onChange original se existir
      if (onChange) {
        onChange(e);
      }
    };
    
    return (
      <input
        type={type}
        data-slot="input"        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-input flex h-10 w-full min-w-0 rounded-xl px-4 py-2 text-base shadow-lg transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm hover:shadow-xl",
          "focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
