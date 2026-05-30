import Image from "next/image"
import Link from "next/link"
import { ClipboardList, Shield, Clock, ChevronRight } from "lucide-react"

export const metadata = {
  title: "特定健診WEB問診システム",
  description: "特定健康診査のWEB問診システムです",
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">

      {/* ── Hero ── */}
      <section className="px-4 py-16 md:py-24 text-white text-center [background:linear-gradient(to_bottom,var(--color-primary),var(--color-accent))]">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-8">
            <Image src="/logo.png" alt="KaNaHiRi" width={48} height={48} className="rounded-xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            特定健診WEB問診システム
          </h1>
          <p className="text-white/80 text-lg">
            特定健康診査のWEB問診を、安心・簡単・スピーディに
          </p>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="max-w-4xl mx-auto w-full px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Shield,
            title: "安心",
            desc: "セキュアな通信でプライバシーをしっかり保護します",
          },
          {
            icon: ClipboardList,
            title: "簡単",
            desc: "直感的なUIで迷わず操作できます",
          },
          {
            icon: Clock,
            title: "スピーディ",
            desc: "来院前に回答しておけば、当日の手続きがスムーズ",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-bg)] mb-4">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-[var(--color-text)]">{title}</h3>
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{desc}</p>
          </div>
        ))}
      </section>

      {/* ── CTA ── */}
      <div className="text-center pb-16">
        <Link
          href="/staff/login"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-primary text-primary px-8 py-3 font-semibold hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-4 focus:ring-primary/30"
        >
          スタッフログイン
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-gray-200 py-6 text-center text-sm text-[var(--color-text-muted)]">
        〇〇クリニック &nbsp;特定健診WEB問診システム
      </footer>
    </div>
  )
}
