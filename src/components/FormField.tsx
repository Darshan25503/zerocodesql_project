import React from 'react';

type FormFieldProps = {
  label: string;
  name: string;
  type: string;
  value: string | number | readonly string[] | boolean | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
};

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder = '',
  options = [],
}) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value as string}
          onChange={onChange}
          placeholder={placeholder}
          className="shadow appearance-none border rounded w-1/2 py-2 px-3  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value as string}
          onChange={onChange}
          className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'radio' ? (
        options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="radio"
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="mr-2"
            />
            <label htmlFor={`${name}-${option.value}`} className="text-gray-700">
              {option.label}
            </label>
          </div>
        ))
      ) : type === 'checkbox' ? (
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={value as boolean}
          onChange={onChange}
          className="mr-2"
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value as string}
          onChange={onChange}
          placeholder={placeholder}
          className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      )}
    </div>
  );
};

export default FormField;
