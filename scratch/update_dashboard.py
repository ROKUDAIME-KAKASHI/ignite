import re

with open("C:/coding/ignite/frontend/src/app/dashboard/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace main bg
content = content.replace(
    '<div className="flex-1 overflow-y-auto">',
    '<div className="flex-1 overflow-y-auto bg-[url(\'https://www.transparenttextures.com/patterns/dark-matter.png\')] bg-fixed bg-[#0a0a0a]">'
)

# Replace Hero
content = content.replace(
    '<div className="relative overflow-hidden px-5 pt-8 pb-12 gradient-dawn">',
    '<div className="relative overflow-hidden px-5 pt-8 pb-12 bg-[#111]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl">'
)
content = content.replace(
    '<div className="absolute inset-0 bg-[url(\'/header-image.png\')] bg-cover bg-center opacity-40 mix-blend-overlay" />',
    '<div className="absolute inset-0 bg-[url(\'/header-image.png\')] bg-cover bg-center opacity-30 mix-blend-overlay" />'
)

# Replace Grace Points
content = content.replace(
    '<Link href="/leaderboard" className="block glass dark:glass-dark rounded-2xl p-4 card-holy shadow-xl group hover:shadow-2xl transition">',
    '<Link href="/leaderboard" className="block bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 shadow-2xl hover:shadow-emerald-500/10 hover:border-white/20 transition-all group">'
)

# Announcements
content = content.replace(
    '<div className="flex items-center justify-between mb-4 bg-muted/40 backdrop-blur-xl p-3 rounded-2xl border border-border/60 shadow-sm relative overflow-hidden">',
    '<div className="flex items-center justify-between mb-4 bg-white/5 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">'
)
content = content.replace(
    '<div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent pointer-events-none" />',
    '<div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent pointer-events-none" />'
)
content = content.replace(
    'className="rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border border-amber-200/60 dark:border-amber-800/30 px-4 py-3 card-holy"',
    'className="rounded-2xl bg-[#111]/80 backdrop-blur-xl border border-amber-500/20 px-4 py-3 shadow-lg hover:border-amber-500/40 transition-colors"'
)

# Events
content = content.replace(
    'className="block rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-200/60 dark:border-green-800/30 px-4 py-3 card-holy card-holy-hover"',
    'className="block rounded-2xl bg-[#111]/80 backdrop-blur-xl border border-white/10 px-4 py-3 shadow-lg hover:border-emerald-500/40 transition-colors group"'
)
content = content.replace('text-foreground font-serif', 'text-white font-serif')
content = content.replace('text-foreground/80', 'text-slate-300')
content = content.replace('text-foreground', 'text-white')
content = content.replace('bg-card', 'bg-white/5 border-t border-white/10')
content = content.replace('text-muted-foreground', 'text-slate-400')


# Daily Verse
content = content.replace(
    '<div className="bg-gradient-to-r from-amber-700/15 to-yellow-600/10 dark:from-amber-700/25 dark:to-yellow-600/15 px-4 pt-4 pb-3 border-b border-amber-200/30 dark:border-amber-800/20">',
    '<div className="bg-[#111]/80 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-white/10">'
)

content = content.replace(
    '<div className="bg-gradient-to-r from-blue-700/10 to-indigo-600/8 dark:from-blue-700/20 dark:to-indigo-600/15 px-4 pt-4 pb-3 border-b border-blue-200/30 dark:border-blue-800/20">',
    '<div className="bg-[#111]/80 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-white/10">'
)

content = content.replace(
    '<div className="bg-gradient-to-r from-red-700/10 to-rose-600/8 dark:from-red-700/20 dark:to-rose-600/15 px-4 pt-4 pb-3 border-b border-red-200/30 dark:border-red-800/20">',
    '<div className="bg-[#111]/80 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-white/10">'
)

content = content.replace(
    '<div className="bg-gradient-to-r from-orange-700/10 to-amber-600/8 dark:from-orange-700/20 dark:to-amber-600/15 px-4 pt-4 pb-3 border-b border-orange-200/30 dark:border-orange-800/20">',
    '<div className="bg-[#111]/80 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-white/10">'
)

content = content.replace(
    '<div className="bg-gradient-to-r from-purple-700/10 to-violet-600/8 dark:from-purple-700/20 dark:to-violet-600/15 px-4 pt-4 pb-3 border-b border-purple-200/30 dark:border-purple-800/20">',
    '<div className="bg-[#111]/80 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-white/10">'
)

content = content.replace(
    '<div className="bg-gradient-to-r from-teal-700/10 to-emerald-600/8 dark:from-teal-700/20 dark:to-emerald-600/15 px-4 pt-4 pb-3 border-b border-teal-200/30 dark:border-teal-800/20">',
    '<div className="bg-[#111]/80 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-white/10">'
)

content = content.replace(
    '<div className="bg-gradient-to-r from-indigo-700/10 to-blue-600/8 dark:from-indigo-700/20 dark:to-blue-600/15 px-4 pt-4 pb-3 border-b border-indigo-200/30 dark:border-indigo-800/20">',
    '<div className="bg-[#111]/80 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-white/10">'
)

# Spiritual Stats cards
content = content.replace('bg-amber-50 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-800/30', 'bg-white/5 border-white/10 text-white')
content = content.replace('bg-blue-50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/30', 'bg-white/5 border-white/10 text-white')
content = content.replace('bg-purple-50 dark:bg-purple-900/20 border-purple-200/50 dark:border-purple-800/30', 'bg-white/5 border-white/10 text-white')

# Saint of the Day
content = content.replace(
    '<div className="rounded-2xl p-4 gradient-lent card-holy">',
    '<div className="rounded-2xl p-4 bg-gradient-to-br from-purple-900 to-[#111] border border-purple-500/20 shadow-xl shadow-purple-500/10 card-holy">'
)

with open("C:/coding/ignite/frontend/src/app/dashboard/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
