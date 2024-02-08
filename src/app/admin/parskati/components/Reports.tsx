'use client';

import {
    Tabs,
    TabsProps,
} from 'antd';
import React, {useRef, useState} from 'react';

import ApplicationReportsTab from './tabs/ApplicationReportsTab';
import ResourceReportsTab from './tabs/ResourceReportsTab';

const Reports = () => {

    const tabsData1: TabsProps['items'] = [
        {
            key: '1',
            label: 'Pieteikumi',
            children: <ApplicationReportsTab />
        },
        {
            key: '2',
            label: 'Resursi',
            children: <ResourceReportsTab />
        },
    ]

    return (
        <Tabs defaultActiveKey="1" items={tabsData1} />
    )
};

export default Reports;
