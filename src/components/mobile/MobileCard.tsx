type Props = {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}

export default function MobileCard({ title, action, children }: Props) {
  return (
    <section className="bg-white dark:bg-gray-800 shadow rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

