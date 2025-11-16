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
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground dark:bg-input/20 border-input/50 flex h-10 w-full min-w-0 rounded-xl border bg-background/50 backdrop-blur-sm px-4 py-2 text-base shadow-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-4 focus-visible:bg-background focus-visible:shadow-md",
          "hover:border-input hover:bg-background/80",
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

export interface InputWithIconProps extends InputProps {
  icon?: React.ReactNode;
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
            {icon}
          </div>
        )}
        <Input
          ref={ref}
          className={cn(icon && "pl-9", className)}
          {...props}
        />
      </div>
    );
  }
);

InputWithIcon.displayName = "InputWithIcon"

export { Input, InputWithIcon }
