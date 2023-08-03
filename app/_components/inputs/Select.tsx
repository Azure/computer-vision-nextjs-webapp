"use client";

import { useTheme } from "@/_lib/client/theme";
import classNames from "classnames";
import { ReactNode, RefCallback } from "react";
import { MultiValue, Options, SingleValue } from "react-select";
import ReactSelect from "react-select";
import ReactSelectCreatable from "react-select/creatable";

type Option<T> = { value: T; label: ReactNode; icon?: ReactNode };

type BaseProps<T> = {
  options: Options<Option<T>>;
  onCreate?: (value: T) => void;
  isSearchable?: boolean;
  isCreatable?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  defaultPrefix?: ReactNode; // Overrides option icon
  placeholder?: string;
  noOptionsMessage?: string;
};

type Props<T> = (
  | {
      onChange?: (value?: T) => void;
      isMulti?: false;
      value?: T;
    }
  | {
      onChange?: (value: T[]) => void;
      isMulti: true;
      value?: T[];
    }
) &
  BaseProps<T>;

export function Select<T extends string = string>({
  options,
  value,
  onChange,
  onCreate,
  isSearchable,
  isCreatable,
  isMulti,
  isLoading,
  isError,
  defaultPrefix,
  placeholder,
  noOptionsMessage,
}: Props<T>) {
  const { themeColors } = useTheme();

  const SelectComponent = isCreatable ? ReactSelectCreatable : ReactSelect;

  const onChangeValue = (v: SingleValue<Option<T>> | MultiValue<Option<T>>) => {
    if (isMulti) {
      const values = v as MultiValue<Option<T>>;
      const onChangeHandler = onChange as
        | ((value: string[]) => void)
        | undefined;

      onChangeHandler?.(values.map(({ value }) => value));
    } else {
      const value = v as SingleValue<Option<T>>;
      const onChangeHandler = onChange as
        | ((value?: string) => void)
        | undefined;

      onChangeHandler?.(value?.value);
    }
  };

  return (
    <SelectComponent
      instanceId={"mediaway-select"}
      options={options}
      placeholder={placeholder}
      onChange={(v) => onChangeValue(v)}
      // @ts-ignore
      onCreateOption={onCreate}
      noOptionsMessage={() => noOptionsMessage || "No options"}
      isLoading={isLoading}
      isDisabled={isLoading}
      isSearchable={isSearchable}
      isMulti={isMulti}
      value={
        isMulti
          ? options.filter((o) => value?.includes(o.value))
          : options.find((o) => o.value === value)
      }
      isClearable
      className={classNames(
        "react-select-input input-bordered input input-md flex h-min items-center justify-center",
        {
          "input-error": isError,
        }
      )}
      components={{
        Option: CustomOption,
      }}
      formatOptionLabel={({ label }) => (
        <div className="flex cursor-pointer items-center gap-4 p-3 hover:bg-gray-300">
          {defaultPrefix}
          {label}
        </div>
      )}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary25: themeColors["base-100"],
          primary: themeColors["base-100"],
          primary50: themeColors["base-100"],
          primary75: themeColors["base-100"],
          neutral0: themeColors["base-100"],
          neutral5: themeColors["base-100"],
          neutral10: "-",
        },
      })}
      styles={{
        control: (provided) => ({
          ...provided,
          width: "100%",
          border: "none",
          backgroundColor: "rgba(0, 0, 0, 0)",
        }),
        input: (provided) => ({
          ...provided,
          // color: isError ? themeColors['error'] : themeColors['neutral-focus'],
        }),
        placeholder: (provided) => ({
          ...provided,
          // color: isError ? themeColors['error'] : provided.color,
        }),
        singleValue: (provided) => ({
          ...provided,
          color: "-",
        }),
        multiValueLabel: (provided) => ({
          ...provided,
          color: "-",
        }),
      }}
    />
  );
}

const CustomOption = ({
  innerProps,
  innerRef,
  data: { label },
}: {
  innerProps: JSX.IntrinsicElements["div"];
  innerRef: RefCallback<HTMLDivElement>;
  data: { value: string; label: ReactNode };
}) => (
  <div
    ref={innerRef}
    {...innerProps}
    className="flex cursor-pointer items-center gap-4 p-3 hover:bg-base-300"
  >
    {label}
  </div>
);
