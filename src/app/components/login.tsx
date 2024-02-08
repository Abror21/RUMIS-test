'use client';

import { Button, Checkbox, Form, Input, Modal } from 'antd';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Slogan } from '@/app/components/slogan';
import { useEffect, useState } from 'react';

import useHandleError from '@/app/utils/useHandleError';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import axios from 'axios';

type FieldType = {
  username?: string;
  password?: string;
};

const Login = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [termsOfUseText, setTermsOfUseText] = useState<string | null>(null)

  const [handleError] = useHandleError();
  const router = useRouter();

  const [form] = Form.useForm()
  const agreed = Form.useWatch('agreed', form)

  useEffect(() => {
    getTermsOfUse()
  }, [])

  const onFinish = async (values: any) => {
    setLoading(true)
    const result = await signIn('default', {
      redirect: false,
      username: values.username,
      password: values.password,
    });

    if (result?.error) {
      setLoading(false)
      if (handleError) {
        handleError({ error: 'Neatpazīts lietotājvārds vai parole' });
      }
    } else {
      router.replace(`/profile`);
    }
  };

  const getTermsOfUse = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/textTemplates/termsOfUse`,
        {},
      );

      const data = response.data;

      setTermsOfUseText(data?.content)
    } catch (error) {
      console.error(error)
    }
  }

  const {
    appendData,
  } = useQueryApiClient({
    request: {
      url: '/log',
      method: 'POST',
      data: {
        message: "Autentificēšanās caur Latvija.lv ir uzsākta"
      }
    },
  });

  const externalLogin = () => {
    window.location.assign(process.env.NEXT_PUBLIC_AUTH_URL!);
    appendData;
  }

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault()

    setIsModalOpen(true)
  };

  return (
    <>
      <Slogan />
      <Form
        data-testid="test-form"
        form={form}
        name="basic"
        labelCol={{ span: 8 }}
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Lietotājvārds"
          name="username"
          rules={[{ required: true, message: 'Lūdzu ievadiet lietotājvārdu!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="Parole"
          name="password"
          rules={[{ required: true, message: 'Lūdzu ievadiet paroli!' }]}
        >
          <Input.Password autoComplete="off" />
        </Form.Item>
        <Form.Item name="agreed" valuePropName="checked" className='gap-2'>
        <Checkbox>
          Apliecinu, ka esmu iepzinies un piekrītu RUMIS{' '}
          <span onClick={openModal} className='cursor-pointer text-blue-400'>
            lietošanas noteikumiem.
          </span>
        </Checkbox>
        </Form.Item>
        <Form.Item>
          <Button loading={loading} type="primary" htmlType="submit" disabled={!agreed}>
            Pieslēgties
          </Button>
        </Form.Item>
        <Form.Item>
          <Button block onClick={externalLogin} disabled={!agreed}>
            Latvija.lv
          </Button>
        </Form.Item>
      </Form>
      <Modal data-testid="test-modal" open={isModalOpen} footer={null} onCancel={() => setIsModalOpen(false)}>
        {termsOfUseText ? 
          <div data-testid="test-div" dangerouslySetInnerHTML={{__html: termsOfUseText}}></div>
          : <p data-testid="test-text">I. Vispārīgie jautājumi<br />1. Šie noteikumi nosaka RUMIS portāla&nbsp;<a href="https://latvija.gov.lv" 
          rel="nofollow">https://rumis.lv</a> (turpmāk – pakalpojumu portāls) lietošanas kārtību.
          <br />2. Noteikumos lietotie termini:<br />2.1. autentifikācija – process, kurā veic subjekta (klienta) 
          identitātes pārbaudi;<br />2.2.Lietotājs – fiziska persona, kas izmanto pakalpojumu portālā pieejamo 
          funkcionalitāti.<br />3. pakalpojumu portāla pārzinis – Rīgas digitālā aģentūra (turpmāk Pakalpojuma sniedzējs),
           nodrosīnot pakalpojumu portālu funkcionalitāti, kas pieprasīts, izmantojot elektroniskās identifikācijas 
           līdzekļus, uzskata, ka pakalpojumu portālu pieprasījuma (pieteikuma) iesniedzējs, veicot autentifikāciju ar 
           Vienotā pieteikšanās moduli un pakalpojuma saņēmējs ir viena un tā pati persona.<br />4. Piekrītot šiem 
           noteikumiem, klients apliecina, ka:<br />4.1. lietos pakalpojumu portālu atbilstoši tā specifikai;<br />
           4.2. neizmantos pakalpojumu portālu nelikumīgu mērķu sasniegšanai;<br />4.3.pakalpojumu portāls tiks izmantoti 
           lietotāja interesēs, nevis citas personas uzdevumā, lai neatklātu šīs personas identitāti.<br />5. Par sniegto 
           pakalpojumu nav noteikta samaksa<br />II. Lietotāja tiesības, pienākumi un atbildība<br />7. Lietotājs ir 
           atbildīgs par pakalpojumu portālā norādīto ziņu patiesumu un pilnīgumu. &nbsp;<br />8. Lietotājs ir atbildīgs 
           par darbībām, kas tiek veiktas pakalpojumu portālā, izmantojot viņa autentifikācijas datus. &nbsp;<br />
           9. Lietotājs, izmantojot pakalpojumu portālu, apņemas nelietot vispārpieņemtām pieklājības normām neatbilstošus 
           vārdus. &nbsp;<br />III. Pakalpojuma sniedzēja pienākumi un atbildība<br />10. Pakalpojuma sniedzējs ievēro 
           informācijas par klientu un tā veikto darbību konfidencialitāti, &nbsp;šī informācija var tikt izpausta trešajām
            personām tikai Latvijas Republikā spēkā esošajos normatīvajos aktos noteiktajos gadījumos un kārtībā. &nbsp;
            <br />11. Pakalpojuma sniedzējs ir tiesīgi vienpusēji veikt izmaiņas sniedzamo pakalpojumu portālu 
            funkcionalitātes apjomā un kārtībā.<br />12. Pakalpojuma sniedzējs neatbild par:<br />12.1. Lietotāja 
            darbībām pakalpojumu portālā un iespējamiem zaudējumiem, kas radušies, ja klienta autentifikācijas dati 
            nonākuši citu personu rīcībā;<br />12.2. pakalpojumu portālu izmantošanu un tās sekām, ja tajā pieprasītos 
            dokumentus klients ir viltojis vai nelikumīgi noformējis vai iesniedzis; &nbsp;&nbsp;<br />12.3. traucējumiem 
            pakalpojumu portāla darbībā, kas radušies no pašvaldības tehniskajiem resursiem neatkarīgu elektronisko 
            sakaru traucējumu gadījumos vai klienta datortehnikas lietošanas dēļ.<br />13. Pakalpojuma sniedzējs negarantē 
            pakalpojumu portāla kvalitātes un apjoma atbilstību klienta priekšstatiem.</p>
        }
      </Modal>
    </>
  );
}

export { Login };
