import { useState } from 'react';

export default function Input({ label, error, className = '', ...props }) {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value !== '' && props.value !== undefined && props.value !== null;
  const { placeholder, ...inputProps } = label ? { ...props, placeholder: undefined } : props;

  return (
    <div className={`${className} relative`}>
      <div className={`relative rounded-xl border transition-all duration-200 ${
        error ? 'border-red-300' : focused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
      } ${props.disabled ? 'bg-slate-50' : 'bg-white'}`}>
        {label && (
          <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
            focused || hasValue
              ? '-top-2.5 text-[11px] font-medium px-1.5 bg-white text-blue-600'
              : 'top-3 text-sm text-slate-400'
          } ${error ? 'text-red-500' : ''}`}>
            {label}
          </label>
        )}
        <input
          className={`w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400
            ${label ? 'pt-4 pb-2.5 px-4' : 'px-4 py-3'}
            ${props.disabled ? 'cursor-not-allowed' : ''}`}
          placeholder={label ? undefined : placeholder}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          {...inputProps}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
