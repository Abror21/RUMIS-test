'use client';

import { Layout } from 'antd';
import dayjs from 'dayjs';
import Image from 'next/image'

const { Footer } = Layout;

const CustomFooter = () => {
    return (
        <Footer style={{ textAlign: 'center' }}>
          <div>©{dayjs().year()} Izglītības resursu uzskaites un monitoringa informācijas sistēma</div>
          <div className='flex gap-8 justify-center pt-4'>
            <Image
              src="/assets/images/izm.png"
              width={90}
              height={90}
              priority={true}
              alt="Izglītības un zinātnes ministrija"
            />
            <Image
              src="/assets/images/LV_ID_EU_logo_ansamblis_ERAF_RGB.png"
              width={435}
              height={90}
              priority={true}
              alt="ERAF"
            />
            <Image
              src="/assets/images/rigas_digitala_agentura_black.png"
              width={280}
              height={90}
              priority={true}
              alt="Rīgas Digitālā aģentūra"
            />
          </div>
        </Footer>
    )
}

export default CustomFooter