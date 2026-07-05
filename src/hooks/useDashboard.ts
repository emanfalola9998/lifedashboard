import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "../app/store/store"
import { setDashboardData } from "@/app/store/dashboardSlice"
import { useEffect, useRef } from "react"

const GET_API_URL = 'http://localhost:9000/dashboard/default-user'
const POST_API_URL = 'http://localhost:9000/dashboard/save/default-user'

export function useDashboard() {
    const hasLoaded = useRef(false)
    const dispatch = useDispatch<AppDispatch>()
    const dashboardData = useSelector((state: RootState) => state.dashboardSlice.dashboardData)

    useEffect(() => {
        const loadData = async () => {
        try {
            const response = await fetch(GET_API_URL)
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
            readingList: data.readingList ?? []
            }))
        } catch { }
        }
        loadData()
    }, [])

    useEffect(() => {
        if (!hasLoaded.current) return

        fetch(POST_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dashboardData)
        }).catch(() => {})
    }, [dashboardData])

    return { dashboardData }
}