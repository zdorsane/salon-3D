import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

interface FieldShellProps {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: ReactNode;
}

const controlClass =
  'min-h-touch w-full rounded-2xl border bg-night/40 px-4 text-ink placeholder:text-ink-muted/70 focus:border-brass focus:outline-none aria-[invalid=true]:border-danger';

/** Étiquette, contrôle, aide et message d'erreur reliés pour les lecteurs d'écran. */
function FieldShell({ id, label, error, hint, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-ink-muted">{label}</label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">{error}</p>
      ) : (
        hint && <p id={`${id}-hint`} className="text-xs text-ink-muted">{hint}</p>
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string): string | undefined {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
};

export function TextField({ id, label, error, hint, className = '', ...input }: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <input id={id} name={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, hint)} className={`${controlClass} border-glass-border ${className}`} {...input} />
    </FieldShell>
  );
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  id: string;
  label: string;
  error?: string | undefined;
  children: ReactNode;
};

export function SelectField({ id, label, error, children, ...select }: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error}>
      <select id={id} name={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error)} className={`${controlClass} border-glass-border [&>option]:bg-night`} {...select}>
        {children}
      </select>
    </FieldShell>
  );
}
