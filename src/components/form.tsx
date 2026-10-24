import { OutlinedInput } from "@mui/material";
import type { ComponentProps } from "react";

type SimpleInputPrompts = ComponentProps<typeof OutlinedInput> & {
  label: string;
};
function renderForm({
  id,
  autoComplete,
  placeholder,
  label,
  onChange,
  ...formPrompts
}: SimpleInputPrompts) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <OutlinedInput
        autoComplete={autoComplete}
        id={id}
        name={id}
        placeholder={placeholder}
        onChange={onChange}
        required
        autoFocus
        //endAdornment={endAdornment}
        {...formPrompts}
      />
    </div>
  );
}
export default renderForm;
