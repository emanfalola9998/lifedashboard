import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "../app/store/store"
import { setDashboardData } from "@/app/store/dashboardSlice"
import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9000'

export function useDashboard() {
    const hasLoaded = useRef(false)
    // ETag of the version this tab last loaded or saved. null = no row exists yet (new user).
    const version = useRef<string | null>(null)
    // Saves run one at a time, so each one sends the version returned by the save before it
    const saveQueue = useRef<Promise<void>>(Promise.resolve())
    const dispatch = useDispatch<AppDispatch>()
    const dashboardData = useSelector((state: RootState) => state.dashboardSlice.dashboardData)
    const { data: session } = useSession()
    const userId = session?.user?.id

    const loadData = async (id: string) => {
        const response = await fetch(`${BASE_URL}/dashboard/${id}`)
        // 404 = new user with nothing saved yet: start empty so auto-save can create the record.
        // Any other error: bail out WITHOUT setting hasLoaded, so we never auto-save over real data.
        if (!response.ok && response.status !== 404) return
        version.current = response.status === 404 ? null : response.headers.get('ETag')
        const data = response.status === 404 ? {} : await response.json()
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
            reminders: data.reminders ?? [],
            budget: data.budget ?? { salary: 0, items: [] },
        }))
    }

    useEffect(() => {
        if (!userId) return
        hasLoaded.current = false
        loadData(userId).catch(error => console.log("error: ", error))
    }, [userId])

    useEffect(() => {
        if (!hasLoaded.current || !userId) return

        const save = async (keepalive = false) => {
            const response = await fetch(`${BASE_URL}/dashboard/save/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Only overwrite the version we last saw; a new user's first save only creates
                    ...(version.current ? { 'If-Match': version.current } : { 'If-None-Match': '*' }),
                },
                body: JSON.stringify(dashboardData),
                keepalive,
            })
            if (response.ok) {
                version.current = response.headers.get('ETag')
            } else if (response.status === 412) {
                // Another tab or device saved first. Load its version instead of overwriting it.
                console.warn("Dashboard changed elsewhere — loading the latest version")
                await loadData(userId)
            }
        }

        const enqueue = () => {
            saveQueue.current = saveQueue.current.then(() => save()).catch(() => {})
        }

        const timer = setTimeout(enqueue, 1500)

        // The page is closing, so this can't wait for the queue — send it now
        const flush = () => { clearTimeout(timer); save(true).catch(() => {}) }
        window.addEventListener('pagehide', flush)

        return () => {
            clearTimeout(timer)
            window.removeEventListener('pagehide', flush)
        }
    }, [dashboardData])

    return { dashboardData }
}
