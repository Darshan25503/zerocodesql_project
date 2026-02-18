const ButtonCheckbox: React.FC<{ checked: boolean, onChange: (checked: boolean) => void, label: string }> = ({ checked, onChange, label }) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-center px-2 py-1 rounded border ${checked ? 'bg-gray-500 text-white' : 'border-gray-400 text-gray-600'} text-xs`}
    >
      {checked ? (
        <>
          <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {label}
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
};

interface PermissionButtonProps {
  type: "c" | "r" | "u" | "d",
  data: boolean,
  setData: (b: boolean) => void;
}

const typeToLabel = (type: "c" | "r" | "u" | "d") => {
  switch (type) {
    case "c":
      return "Create";
    case "r":
      return "Read";
    case "u":
      return "Update";
    case "d":
      return "Delete";
  }
}

export const PermissionButton = (props: PermissionButtonProps) => {
  return (<ButtonCheckbox
    checked={props.data}
    onChange={(checked) => {
      props.setData(checked);
    }}
    label={typeToLabel(props.type)}
  />)
}