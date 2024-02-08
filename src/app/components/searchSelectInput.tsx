import React from 'react';
import { Empty, Select } from 'antd';
import type { SelectProps } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

type SearchSelectInputProps = {
  filterOption?: Function
} & SelectProps

const SearchSelectInput = (props: SearchSelectInputProps) => {
  const {options = [], ...otherProps} = props;
  const showSearch = Array.isArray(options) && options?.length > 3;

  const defaultFilterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  return (
    <Select
      {...otherProps}
      showSearch={showSearch}
      // @ts-ignore
      filterOption={props.filterOption ?? defaultFilterOption}
      options={options}
      filterSort={(optionA: any, optionB: any) =>
        (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
      }
      notFoundContent={<Empty description={'Nav datu'} />}
    />
  );
};

export default SearchSelectInput;
