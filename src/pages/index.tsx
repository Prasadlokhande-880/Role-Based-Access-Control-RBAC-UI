import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { SectorsPieChart, StateDataChart, TimeTrend } from '@/components/dashboard'
import { useUserStore } from '@/store/UserStore'
import { useGetData } from '@/hooks/useGetData'
import { Toaster, toast } from 'react-hot-toast'

import Head from 'next/head'

export default function Home() {
  const router = useRouter()

  // check if user is admin
  const [user, setUser] = useUserStore((state: any) => [state.user, state.setUser])

  // state data
  const [badgeData, setBadgeData] = useState<Array<string>>([])
  const [societyData, setSocietyData] = useState<SocietyDataOverYears[]>([])
  const [sectors, setSectors] = useState<Array<SectorsData>>([])
  const [stateData, setStateData] = useState<Array<StateData>>([])
  const [loading, setLoading] = useState<boolean>(true)

  // toast notification
  const notify = () => toast.success(<p className='font-bold text-md'>You are not authorised to view this page</p>)

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user')!)
    const userIsAdmin = user?.role === 'ADMIN' || loggedInUser?.role === 'ADMIN'

    const fetchHomePageData = async () => {
      setLoading(true)

      const data = await useGetData('home', loggedInUser.token)
      if (!data) {
        notify()
        return
      }
      const { badgeData, sectors, societyData, stateData } = data

      setBadgeData(badgeData)
      setSectors(sectors)
      setSocietyData(societyData)
      setStateData(stateData)

      setLoading(false)
    }
    setUser(loggedInUser)
    userIsAdmin ? fetchHomePageData() : router.push('/user/login')
  }, [])

  return (
    <>
      <Head>
        <title>CRCS</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Toaster />

      <div className='mx-4 text-gray-700'>
        {loading ?
          <img className='h-20 w-70 mx-auto rounded-full' src='https://miro.medium.com/v2/resize:fit:1400/1*CsJ05WEGfunYMLGfsT2sXA.gif' alt='loader' />
          :
          <div className=''>

            {/* badge data  */}
            <div className='flex space-x-10 p-1 ml-72'>
              {badgeData?.map((item: any, index) => (
                <div key={index}
                  className={`${index % 2 === 0 ? 'bg-red-100' : 'bg-blue-100'} p-2 w-40 shadow-sm shadow-gray-400 text-center rounded-xl`}
                >
                  <p className='text-3xl font-bold'>{item.value}</p>
                  <p className='text-md mt-1 font-semibold'>{item.title}</p>
                </div>
              ))}
            </div>
            <div className='flex space-x-20 items-start h-60 my-7'>
              {/* sectors pie chart */}
              <div className='border-r border-gray-300'>
                {sectors && <SectorsPieChart sectors={sectors} />}
              </div>
              {/* society registration trend over time */}
              {societyData && <TimeTrend societyData={societyData} />}
            </div>
            <div className='mt-14 p-10'>
              {stateData && <StateDataChart stateData={stateData} />}
            </div>
          </div>
        }
      </div>
    </>
  )
}