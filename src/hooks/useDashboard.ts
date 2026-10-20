import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "../app/store/store"
import { setDashboardData } from "@/app/store/dashboardSlice"
import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9000'

/** Reads the dashboard from Redux. Safe to call from any number of components. */
export function useDashboard() {
    const dashboardData = useSelector((state: RootState) => state.dashboardSlice.dashboardData)
    return { dashboardData }
}

/** Loads the dashboard and auto-saves every change. Call this exactly ONCE (in page.tsx).
 *
 * Each call is a separate loader and saver with its own version, so several of them race:
 * one save wins, the rest get 412, reload, and save again — forever.
 */
export function useDashboardSync() {
    const hasLoaded = useRef(false)
    // ETag of the version this tab last loaded or saved.
    //   null      = no row exists yet (new user) → save with If-None-Match: *
    //   undefined = the response carried no ETag → save with no precondition, as before versioning,
    //               rather than claiming to be a new user (which always 412s for an existing row)
    const version = useRef<string | null | undefined>(undefined)
    // Set when a 412 reload replaces the data, so that reload doesn't immediately trigger another save
    const skipNextSave = useRef(false)
    // Saves run one at a time, so each one sends the version returned by the save before it
    const saveQueue = useRef<Promise<void>>(Promise.resolve())
    const dispatch = useDispatch<AppDispatch>()
    const dashboardData = useSelector((state: RootState) => state.dashboardSlice.dashboardData)
    const { data: session } = useSession()
    const userId = session?.user?.id

    const loadData = async (id: string, { skipSave = false } = {}) => {
        const response = await fetch(`${BASE_URL}/dashboard/${id}`)
        // 404 = new user with nothing saved yet: start empty so auto-save can create the record.
        // Any other error: bail out WITHOUT setting hasLoaded, so we never auto-save over real data.
        if (!response.ok && response.status !== 404) return
        version.current = response.status === 404 ? null : (response.headers.get('ETag') ?? undefined)
        const data = response.status === 404 ? {} : await response.json()
        hasLoaded.current = true
        skipNextSave.current = skipSave
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
        // This change is the server's own data from a 412 reload — saving it back would be pointless
        if (skipNextSave.current) { skipNextSave.current = false; return }

        const precondition = (): Record<string, string> =>
            version.current ? { 'If-Match': version.current }      // only overwrite the version we last saw
            : version.current === null ? { 'If-None-Match': '*' }   // new user: only create
            : {}                                                    // version unknown: save as before

        const save = async (keepalive = false) => {
            const response = await fetch(`${BASE_URL}/dashboard/save/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...precondition() },
                body: JSON.stringify(dashboardData),
                keepalive,
            })
            if (response.ok) {
                version.current = response.headers.get('ETag') ?? undefined
            } else if (response.status === 412) {
                // Another tab or device saved first. Load its version instead of overwriting it.
                console.warn("Dashboard changed elsewhere — loading the latest version")
                await loadData(userId, { skipSave: true })
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
}
