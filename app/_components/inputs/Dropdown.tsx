'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { ReactNode, useMemo, useRef, useState } from 'react';
import { Image } from '../Image';
import { Avatar } from '../../(app)/_components/Avatar';
import classNames from 'classnames';

type DropdownPosition = 'dropdown-end' | 'dropdown-top' | 'dropdown-bottom' | 'dropdown-left' | 'dropdown-right';

type Props<T> = {
  onChange: (value: T) => void;
  options: { label: string; value: T; imageUrl?: string; icon?: ReactNode }[];
  selected?: T;
  title?: T;
  wide?: boolean;
  noOutline?: boolean;
  display?: ReactNode;
  dropdownPosition?: DropdownPosition;
};

export function Dropdown<T extends string = string>({
  onChange,
  options,
  title,
  selected,
  wide,
  noOutline,
  display,
  dropdownPosition = 'dropdown-bottom',
}: Props<T>) {
  const [selectedValue, setSelectedValue] = useState(selected);
  const selectedOption = useMemo(
    () => options.find(option => option.value === selectedValue),
    [selectedValue, options],
  );
  const ref = useRef<HTMLDetailsElement>(null);

  const onClickOption = (value: T) => {
    if (!display) {
      setSelectedValue(value);
    }
    onChange(value);
    ref.current?.removeAttribute('open');
  };

  return (
    <details className={classNames('dropdown', dropdownPosition)} ref={ref}>
      <summary className={`btn ${noOutline ? 'btn-ghost' : 'btn-outline'} no-animation flex flex-nowrap items-center`}>
        <span className="flex flex-row items-center gap-3 whitespace-nowrap">
          {selectedOption?.imageUrl && (
            <Image src={selectedOption.imageUrl} size={32} className="rounded-full" alt="dropdown item" />
          )}
          {selectedOption?.icon || ''}
          {display || selectedOption?.label || title}
        </span>
        <ChevronDownIcon className="h-4 w-4" />
      </summary>
      <ul
        className={`dropdown-content menu rounded-box z-10 bg-neutral p-2 shadow ${
          wide ? 'w-96' : 'w-52'
        } max-h-96 overflow-auto`}
      >
        {options.map(({ label, value, imageUrl, icon }, i) => (
          <li className="flex flex-row items-center" key={i} onClick={() => onClickOption(value)}>
            <a className="flex w-full gap-1.5 text-white">
              {imageUrl && <Image src={imageUrl} size={32} className="rounded-full" alt="dropdown item" />}
              {icon || ''}
              <div className="text-neutral-content">{label}</div>
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
