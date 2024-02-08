import { Row, Col, Dropdown, Button } from 'antd';
import { UserProfile } from '@/app/components/userProfile';
import { UserType, ListPersonProfileType } from '@/app/admin/users/components/users';
import { profileName, personStatus } from '@/app/utils/utils';
import { StopOutlined, CheckOutlined } from '@ant-design/icons';
import { Dispatch, SetStateAction, useMemo } from 'react';

type NewType = SetStateAction<UserType | null>;

interface UserProfileListProps {
  user: UserType | null,
  setUser: Dispatch<NewType>,
  actionView: (val: ListPersonProfileType) => void,
  actionEdit: (val: ListPersonProfileType) => void,
  actionDelete: (val: ListPersonProfileType) => void,
  refresh: () => void
}

const UserProfileList = ({ user, setUser, actionView, actionEdit, actionDelete, refresh }: UserProfileListProps) => {
  if (user === null) {
    return (<></>)
  }

  const globalStatus: boolean = personStatus(user)

  // TODO: check permissions
  const items = (profile: ListPersonProfileType) => {
    const links = {items: [
      {
        key: 'edit',
        label: (
          <button type="button" onClick={() => actionEdit(profile)}>
            Labot
          </button>
        ),
      }
    ]}

    if (!profile.isLoggedIn) {
      links.items.push({
        key: 'delete',
        label: (
          <button type="button" onClick={() => actionDelete(profile)}>
            Dzēst
          </button>
        )
      })
    }

    return links
  };
  const allowEdit = useMemo(() => {
    if (!user.userProfiles || user.userProfiles.length === 0) {
      return true;
    }

    return !user.userProfiles.some(profile => profile.isLoggedIn === true)
  }, [user])
  return (
    <>
      <UserProfile 
        title={`${user.persons[0].firstName} ${user.persons[0].lastName} (${user.persons[0].privatePersonalIdentifier})`} 
        status={globalStatus}
        allowEdit={allowEdit}
        person={user.persons[0]}
        setPerson={setUser}
        userId={user.personTechnicalId ?? user.userId}
        refresh={refresh}
      />
      <div>
        { user.userProfiles?.map((profile: ListPersonProfileType) => {
          const links = items(profile)

          return (
            <Row key={profile.id} className='mb-5 pb-2 border-b'>
              <Col flex="1 1 300px">
                <div className='font-bold'>
                  {profileName(profile)}
                </div>
                <div>{profile.roles.join(', ')}</div>
              </Col>
              <Col flex="1 1 50px" className='px-3'>
                {profile.isDisabled ?
                  <StopOutlined />
                  :
                  <>
                    {profile.isLoggedIn &&
                      <CheckOutlined />
                    }
                  </>
                }
              </Col>
              <Col flex="0 1 100px">
                {/* TODO: check status if disabled or date expired hide button */}
                {links.items.length === 0 ?
                  <Button
                    onClick={() => actionView(profile)}
                  >
                    Skatīt
                  </Button>
                :
                  <Dropdown.Button
                    onClick={() => actionView(profile)}
                    menu={links}
                  >
                    Skatīt
                  </Dropdown.Button>
                }
              </Col>
            </Row>
          )
        })}
      </div>
    </>
  );
}

export { UserProfileList };
