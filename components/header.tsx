interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-6">
      <div className="flex items-center gap-4">
        <div className="glass-card rounded-2xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SM</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Sherdor Mebel</h1>
              <p className="text-xs text-muted-foreground">Biznes boshqaruv tizimi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        
      </div>
    </header>
  )
}
