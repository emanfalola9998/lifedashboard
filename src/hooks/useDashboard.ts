import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "../app/store/store"
import { setDashboardData } from "@/app/store/dashboardSlice"
import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9000'

export function useDashboard() {
    const hasLoaded = useRef(false)
    const dispatch = useDispatch<AppDispatch>()
    const dashboardData = useSelector((state: RootState) => state.dashboardSlice.dashboardData)
    const { data: session } = useSession()
    const userId = session?.user?.id

    useEffect(() => {
        if (!userId) return
        hasLoaded.current = false

        const loadData = async () => {
            try {
                const response = await fetch(`${BASE_URL}/dashboard/${userId}`)
                if (!response.ok) return
                const data = await response.json()
                hasLoaded.current = true
                dispatch(setDashboardData({
                    weekData: {
                        tasks: data.weekData?.tasks ?? [],
                        gymDays: data.weekData?.gymDays ?? [],
                        focus: data.weekData?.focus ?? "",
                        reflections: data.weekData?.reflections ?? "",
                    },
                    goals: data.goals ?? [],
                    habits: data.habits ?? [],
                    readingList: data.readingList ?? [],
                    countdown: data.countdown ?? [],
                    weekSchedule: data.weekSchedule ?? {},
                    reflections: data.reflections ?? [],
                    dailyIntention: data.dailyIntention ?? "",
                }))
            } catch (error) { console.log("error: ", error) }
        }

        loadData()
    }, [userId])

    useEffect(() => {
        if (!hasLoaded.current || !userId) return

        fetch(`${BASE_URL}/dashboard/save/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dashboardData)
        }).catch(() => {})
    }, [dashboardData])

    return { dashboardData }
}
