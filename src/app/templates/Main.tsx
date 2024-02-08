import type { ReactNode } from 'react';
import { Layout } from 'antd';
import dayjs from 'dayjs';
import Image from 'next/image'

const { Footer } = Layout;

type IMainProps = {
  children: ReactNode;
  showCustomFooter?: boolean
};

const Main = (props: IMainProps) => (
  <div className="w-full bg-bg">
    <div className="mx-auto max-w-screen-md min-h-screen">
      <main className="content">
        <div className='container h-screen-mod mx-aut'>
          <div className='flex-mod p-3 flex-auto mx-auto h-screen-mod flex-row'>
            <div className='basis-full bg-white border border-gray-300 rounded-md mx-auto max-w-[400px] h-fit self-center p-6'>
              {props.children}
            </div>
            {props?.showCustomFooter && 
              <div className='rumis-logos'>
                <div className='text-center'>©{dayjs().year()} Izglītības resursu uzskaites un monitoringa informācijas sistēma</div>
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
              </div>
            }
          </div>
        </div>
      </main>
    </div>
  </div>
);

export { Main };
