"use client"
import React, { useContext } from 'react';
import MenoresAlExtranjero from '@components/menores-extranjero/menoresAlExtranjero';
import MenoresContext from '@context/menoresContext';
import HomeLayout from '@components/homeLayout';
import WidgetLoader from "@components/widgetLoader";
import SaleComponent from "@components/saleComponent"; 
import BaseMenoresExtranjeroPage from './BaseMenoresExtranjeroPage';

const Page: React.FC = () => <BaseMenoresExtranjeroPage />;

export default Page;