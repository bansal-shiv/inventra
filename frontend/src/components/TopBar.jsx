export default function TopBar() {
  return (
    <header className="border-b border-stone-200 bg-white/70 backdrop-blur">
      <div className="flex items-center justify-between px-5 py-5 md:px-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Inventra
        </h1>
        <div className="hidden text-xs text-stone-400 sm:block">
          A small tool for shops that keep an eye on stock.
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
    </header>
  )
}