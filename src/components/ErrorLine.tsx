import { useCallback, useEffect, useState } from 'react'
import { RotateCw } from 'lucide-react'

const QUOTES = [
  '“Aadmi tabhi bada banta hai … jab bade log usse milne ka intezaar kare.” — Once Upon a Time in Mumbaai',
  '“Zindagi ho toh smuggler jaisi … saari duniya raakh ki tarah neeche aur khud dhuen ke tarah upar.” — Once Upon a Time in Mumbaai',
  '“Raaste ki parwah karoonga toh … manzil bura maan jayegi.” — Once Upon a Time in Mumbaai',
  '“Sher se hal chalaoge toh kisaan toh marega hi.” — Once Upon a Time in Mumbaai',
  '“Mushkil toh yeh hai ki main abhi theek tarah se bigda bhi nahi … aur tumne sudhaarna shuru kar diya.” — Once Upon a Time in Mumbaai',
  '“Joh bistar pe zabaan dete hai … woh aksar badal jaate hai.” — Once Upon a Time in Mumbaai',
  '“Jab dost banake kaam ho sakta hai … toh phir dushman kyun banaye?” — Once Upon a Time in Mumbaai',
  '“Joh haarta hai, wohi toh jeetne ka matlab jaanta hai.” — Jannat',
  '“Cricketer aur film stars mein zyada farak nahi hota … dono ki jawani khatam, toh kahani khatam.” — Jannat',
  '“Agar kisi cheez ko dil se chaho … toh poori kaynaat use tumse milane mein lag jaati hai.” — Jannat',
  '“Paisa nahi hai toh kya hua … pyaar toh hai.” — Jannat',
  '“Main ek aam aadmi hoon … lekin meri aadatein aam nahi hain.” — Jannat',
  '“Kuch cheezein sirf paane ke liye nahi hoti … unke liye ladna bhi padta hai.” — Awarapan',
  '“Har kisi ko ek baar mauka milta hai … apni zindagi badalne ka.” — Awarapan',
  '“Meri zindagi ka ek hi maqsad hai … apne gunaahon ka hisaab chukana.” — Awarapan',
  '“Pyaar mein jeena bhi ek nasha hai … aur marna bhi.” — Murder',
  '“Mohabbat mein sirf paana hi zaroori nahi … khona bhi padta hai.” — Tum Mile',
  '“Kuch rishtey zindagi bhar saath nahi hote … lekin zindagi bhar yaad rehte hain.” — Hamari Adhuri Kahani',
  '“Zindagi mein har cheez ka ek waqt hota hai … aur har waqt ki apni ek kahani.” — Hamari Adhuri Kahani',
  '“Jo waqt ke saath nahi badalta … waqt usse badal deta hai.” — Once Upon a Time in Mumbaai',
] as const

const ROTATE_MS = 60_000

export function ErrorLine() {
  const [index, setIndex] = useState(0)
  const [timerKey, setTimerKey] = useState(0)

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % QUOTES.length)
    setTimerKey((k) => k + 1)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % QUOTES.length)
    }, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [timerKey])

  return (
    <div className="flex items-center justify-center gap-2 px-2">
      <p
        key={index}
        className="animate-[fade-in_0.45s_ease] text-center text-base font-medium tracking-wide text-white/95 sm:text-[20px]"
      >
        {QUOTES[index]}
      </p>
      <button
        type="button"
        onClick={next}
        className="shrink-0 rounded-full p-1 text-white/70 transition hover:text-white active:scale-95"
        aria-label="Next quote"
        title="Next quote"
      >
        <RotateCw className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}
